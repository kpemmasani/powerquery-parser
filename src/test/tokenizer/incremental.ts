import { expect } from "chai";
import "mocha";
import { Tokenizer, ILineTokens, IToken, IState } from "./common";
import { Lexer, LexerSnapshot } from "../../lexer";
import { ResultKind } from "../../common";

const tokenizer = new Tokenizer("\n");

const OriginalQuery = `shared Query1 =
let
   source = Csv.Document(binaryContent),
   count = Table.RowCount(source),
   string = "text",
   numbers = 123 + 456
in
   count + 3;`;

class MockDocument2 {
    private lexerState: Lexer.State;

    constructor(initialText: string) {
        this.lexerState = Lexer.stateFrom(initialText);
    }

    public applyChange(text: string, range: Lexer.Range) {
        const stateResult = Lexer.updateRange(this.lexerState, range, text);

        if (!(stateResult.kind === ResultKind.Ok)) {
            throw new Error(`AssertFailed:stateResult.kind === ResultKind.Ok ${JSON.stringify(stateResult, null, 4)}`);
        }

        this.lexerState = stateResult.value;
    }

    public getText(): string {
        let snapshotResult = LexerSnapshot.tryFrom(this.lexerState);

        if (!(snapshotResult.kind === ResultKind.Ok)) {
            throw new Error(`AssertFailed:snapshotResult.kind === ResultKind.Ok ${JSON.stringify(snapshotResult, null, 4)}`);
        }

        return snapshotResult.value.text;
    }
}

// TODO: Replace with MockDocument2 to use built-in incremental updates
class MockDocument {
    public readonly tokenizer: Tokenizer = new Tokenizer("\n");
    public lines: string[];
    public lineEndStates: IState[];
    public lineTokens: IToken[][];

    constructor(initialText: string) {
        this.lines = initialText.split("\n");
        this.lineEndStates = new Array(this.lines.length);
        this.lineTokens = new Array(this.lines.length);

        this.startTokenize(0);
    }

    public applyChangeAndTokenize(newText: string, index: number): number {
        this.lines[index] = newText;
        return this.startTokenize(index);
    }

    // returns number of lines that were tokenized.
    // will always tokenize at least 1 line.
    private startTokenize(startingIndex: number = 0): number {
        expect(startingIndex).is.lessThan(this.lines.length);

        let tokenizedLineCount: number = 0;

        // Get the state for the previous line
        let state: IState;
        if (startingIndex == 0 || this.lineEndStates[startingIndex - 1] == null) {
            state = this.tokenizer.getInitialState();
        } else {
            state = this.lineEndStates[startingIndex - 1];
        }

        for (let i = startingIndex; i < this.lines.length; i++) {
            const result: ILineTokens = tokenizer.tokenize(this.lines[i], state);
            this.lineTokens[i] = result.tokens;
            tokenizedLineCount++;

            // If the new end state matches the previous state, we can stop tokenizing
            if (result.endState.equals(this.lineEndStates[i])) {
                break;
            }

            // Update line end state and pass on new state value
            state = result.endState.clone();
            this.lineEndStates[i] = state;
        }

        return tokenizedLineCount;
    }
}

describe("MockDocument validation", () => {
    it("No change", () => {
        const document = new MockDocument2(OriginalQuery);
        expect(document.getText()).equals(OriginalQuery, "unexpected changed text");
    });

    it("Insert at beginning", () => {
        const document = new MockDocument2(OriginalQuery);
        const changeToMake: string = "    ";
        document.applyChange(changeToMake, {
            start: { lineNumber: 0, lineCodeUnit: 0 },
            end: { lineNumber: 0, lineCodeUnit: 0 },
        });

        const changedText = document.getText();
        expect(changedText).equals(changeToMake + OriginalQuery, "unexpected changed text");
    });

    it("Change first line", () => {
        const document = new MockDocument2(OriginalQuery);

        document.applyChange("Query2", {
            start: { lineNumber: 0, lineCodeUnit: 7 },
            end: { lineNumber: 0, lineCodeUnit: 13 },
        });

        const originalWithChange = OriginalQuery.replace("Query1", "Query2");
        const changedDocumentText = document.getText();
        expect(changedDocumentText).equals(originalWithChange, "unexpected changed text");
    });

    it("Change middle of document", () => {
        const document = new MockDocument2(OriginalQuery);

        document.applyChange("numbers123", {
            start: { lineNumber: 5, lineCodeUnit: 3 },
            end: { lineNumber: 5, lineCodeUnit: 10 },
        });

        const originalWithChange = OriginalQuery.replace("numbers", "numbers123");
        const changedDocumentText = document.getText();
        expect(changedDocumentText).equals(originalWithChange, "unexpected changed text");
    });

    it("Delete most of the document", () => {
        const document = new MockDocument2(OriginalQuery);

        document.applyChange("", {
            start: { lineNumber: 1, lineCodeUnit: 0 },
            end: { lineNumber: 7, lineCodeUnit: 10 },
        });

        const originalWithChange = "shared Query1 =\n 3;";
        const changedDocumentText = document.getText();
        expect(changedDocumentText).equals(originalWithChange, "unexpected changed text");
    });
});

describe("Incremental updates", () => {
    it("Reparse with no change", () => {
        const document = new MockDocument(OriginalQuery);
        const originalLine = document.lines[2];
        const count = document.applyChangeAndTokenize(originalLine, 2);
        expect(count).equals(1, "we should not have tokenized more than one line");
    });

    it("Reparse with simple change", () => {
        const document = new MockDocument(OriginalQuery);
        const modified = document.lines[2].replace("source", "source123");
        const count = document.applyChangeAndTokenize(modified, 2);
        expect(count).equals(1, "we should not have tokenized more than one line");
    });

    it("Reparse with unterminated string", () => {
        const lineNumber = 4;
        const document = new MockDocument(OriginalQuery);
        const modified = document.lines[lineNumber].replace(`"text",`, `"text`);
        const count = document.applyChangeAndTokenize(modified, lineNumber);
        expect(count).equals(document.lines.length - lineNumber, "remaining lines should have been tokenized");

        for (let i = lineNumber + 1; i < document.lineTokens.length; i++) {
            const lineTokens = document.lineTokens[i];
            lineTokens.forEach(token => {
                expect(token.scopes).equals("StringContent", "expecting remaining tokens to be strings");
            });
        }
    });

    it("Reparse with unterminated block comment", () => {
        const lineNumber = 3;
        const document = new MockDocument(OriginalQuery);
        const modified = document.lines[lineNumber].replace(`rce),`, `rce), /* my open comment`);
        const count = document.applyChangeAndTokenize(modified, lineNumber);
        expect(count).equals(document.lines.length - lineNumber, "remaining lines should have been tokenized");

        for (let i = lineNumber + 1; i < document.lineTokens.length; i++) {
            const lineTokens = document.lineTokens[i];
            lineTokens.forEach(token => {
                expect(token.scopes).equals("MultilineCommentContent", "expecting remaining tokens to be comments");
            });
        }
    });

    // TODO: add tests that insert newlines into the original query
});