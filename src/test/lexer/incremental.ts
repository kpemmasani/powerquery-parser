import { expect } from "chai";
import "mocha";
import { Result, ResultKind } from "../../common";
import { Lexer, LexerError, LexerSnapshot } from "../../lexer";
import { expectLexOk } from "./common";

const LINE_TERMINATOR: string = `\n`;

type AbridgedTLexerLine = ReadonlyArray<[Lexer.LineKind, Lexer.LineMode, Lexer.LineMode, string]>;

function expectAbridgedTLexerLine(state: Lexer.State, expected: AbridgedTLexerLine) {
    const actual = state.lines.map((line: Lexer.TLine) => [line.kind, line.lineModeStart, line.lineModeEnd, line.text]);
    expect(actual).deep.equal(expected);
}

function expectLexerUpdateRangeOk(
    originalText: string,
    newText: string,
    range: Lexer.Range,
): Lexer.State {
    const state = expectLexOk(originalText);

    const stateResult = Lexer.updateRange(state, range, newText);
    if (!(stateResult.kind === ResultKind.Ok)) {
        throw new Error(`AssertFailed: stateResult.kind === ResultKind.Ok ${JSON.stringify(stateResult, null, 4)}`);
    }

    return stateResult.value;
}

function expectLexerUpdateLine(
    originalText: string,
    expectedOriginal: AbridgedTLexerLine,
    lineNumber: number,
    newText: string,
    expectedUpdate: AbridgedTLexerLine,
): Lexer.State {
    let state = expectLexOk(originalText);
    expectAbridgedTLexerLine(state, expectedOriginal);

    const stateResult = Lexer.updateLine(state, lineNumber, newText);
    if (!(stateResult.kind === ResultKind.Ok)) {
        throw new Error(`AssertFailed: stateResult.kind === ResultKind.Ok ${JSON.stringify(stateResult, null, 4)}`);
    };

    state = stateResult.value;
    expectAbridgedTLexerLine(stateResult.value, expectedUpdate);

    return state;
}

function expectLexerUpdateLineAlphaBravoCharlie(
    newText: string,
    lineNumber: number,
    expectedUpdate: AbridgedTLexerLine,
): Lexer.State {
    const originalText: string = `alpha${LINE_TERMINATOR}bravo${LINE_TERMINATOR}charlie`;
    const originalExpected: AbridgedTLexerLine = [
        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
    ];
    return expectLexerUpdateLine(originalText, originalExpected, lineNumber, newText, expectedUpdate);
}

describe(`Lexer.Incremental`, () => {

    describe(`Lexer.updateRange`, () => {
        it(`foobar -> Xfoobar`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 0,
                },
                end: {
                    lineNumber: 0,
                    lineCodeUnit: 0,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foobar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("Xfoobar");
        });

        it(`foobar -> fooXbar`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 3,
                },
                end: {
                    lineNumber: 0,
                    lineCodeUnit: 3,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foobar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("fooXbar");
        });

        it(`foobar -> Xoobar`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 0,
                },
                end: {
                    lineNumber: 0,
                    lineCodeUnit: 1,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foobar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("Xoobar");
        });

        it(`foobar -> X`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 0,
                },
                end: {
                    lineNumber: 0,
                    lineCodeUnit: 6,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foobar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("X");
        });

        it(`foo\\nbar -> X`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 0,
                },
                end: {
                    lineNumber: 1,
                    lineCodeUnit: 3,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foo\nbar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("X");
        });

        it(`foo\\nbar -> fXr`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 1,
                },
                end: {
                    lineNumber: 1,
                    lineCodeUnit: 2,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foo\nbar`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(1);
            expect(state.lines[0].text).to.equal("fXr");
        });

        it(`foo\\nbar\\baz -> foo\\nX\\nbaz`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 1,
                    lineCodeUnit: 0,
                },
                end: {
                    lineNumber: 1,
                    lineCodeUnit: 3,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foo\nbar\nbaz`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(3);
            expect(state.lines[0].text).to.equal("foo");
            expect(state.lines[1].text).to.equal("X");
            expect(state.lines[2].text).to.equal("baz");
        });

        it(`foo\\nbar\\baz -> foo\\nbXr\\nbaz`, () => {
            const range: Lexer.Range = {
                start: {
                    lineNumber: 1,
                    lineCodeUnit: 1,
                },
                end: {
                    lineNumber: 1,
                    lineCodeUnit: 2,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                `foo\nbar\nbaz`,
                "X",
                range
            );
            expect(state.lines.length).to.equal(3);
            expect(state.lines[0].text).to.equal("foo");
            expect(state.lines[1].text).to.equal("bXr");
            expect(state.lines[2].text).to.equal("baz");
        });

        it(`lineTerminator maintained on single line change`, () => {
            const original: string = `foo\nbar\nbaz`;
            const range: Lexer.Range = {
                start: {
                    lineNumber: 1,
                    lineCodeUnit: 1,
                },
                end: {
                    lineNumber: 1,
                    lineCodeUnit: 2,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                original,
                "X",
                range
            );

            const snapshotResult: Result<LexerSnapshot, LexerError.TLexerError> = LexerSnapshot.tryFrom(state);
            expect(snapshotResult.kind).equals(ResultKind.Ok);
            if (!(snapshotResult.kind === ResultKind.Ok)) {
                throw new Error(`AssertFailed: snapshotResult.kind === ResultKind.Ok ${JSON.stringify(snapshotResult, null, 4)}`);
            }
            const snapshot: LexerSnapshot = snapshotResult.value;
            expect(snapshot.text).equals(`foo\nbXr\nbaz`, "expected snapshot text doesn't match");
        });

        it(`lineTerminator maintained on multiline change`, () => {
            const original: string = `foo\nbar\nbaz\nboo`;
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 1,
                },
                end: {
                    lineNumber: 2,
                    lineCodeUnit: 1,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                original,
                "OO\nB",
                range
            );
            expect(state.lines.length).to.equal(3);

            const snapshotResult = LexerSnapshot.tryFrom(state);
            if (!(snapshotResult.kind === ResultKind.Ok)) {
                throw new Error(`AssertFailed: snapshotResult.kind === ResultKind.Ok ${JSON.stringify(snapshotResult, null, 4)}`);
            }
            const snapshot: LexerSnapshot = snapshotResult.value;
            expect(snapshot.text).equals(`fOO\nBaz\nboo`, "expected snapshot text doesn't match");
        });

        it(`text match on multiline deconstion`, () => {
            const original: string = `foo\nbar\nbaz\nboo`;
            const range: Lexer.Range = {
                start: {
                    lineNumber: 0,
                    lineCodeUnit: 1,
                },
                end: {
                    lineNumber: 2,
                    lineCodeUnit: 1,
                },
            };
            const state: Lexer.State = expectLexerUpdateRangeOk(
                original,
                "",
                range
            );

            expect(state.lines.length).to.equal(2);

            const snapshotResult: Result<LexerSnapshot, LexerError.TLexerError> = LexerSnapshot.tryFrom(state);
            if (!(snapshotResult.kind === ResultKind.Ok)) {
                throw new Error(`AssertFailed: snapshotResult.kind === ResultKind.Ok ${JSON.stringify(snapshotResult, null, 4)}`);
            }
            const snapshot: LexerSnapshot = snapshotResult.value;
            expect(snapshot.text).equals("faz\nboo", "expected snapshot text doesn't match");
        });
    });

    describe(`Lexer.updateLine`, () => {
        describe(`single line`, () => {
            it(`identifier -> identifier`, () => {
                expectLexerUpdateLine(
                    `foo`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foo`],
                    ],
                    0,
                    `foobar`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    ],
                );
            });

            it(`identifier -> unterminated string`, () => {
                expectLexerUpdateLine(
                    `foo`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foo`],
                    ],
                    0,
                    `"`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    ],
                );
            });

            it(`unterminated string -> identifier`, () => {
                expectLexerUpdateLine(
                    `"`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    ],
                    0,
                    `foobar`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    ],
                );
            });
        });

        describe(`multiple lines, no mode change`, () => {
            it(`first`, () => {
                expectLexerUpdateLine(
                    `"`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    ],
                    0,
                    `foobar`,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    ],
                );
            });

            it(`first`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    0,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                    ],
                );
            });

            it(`middle`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    1,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                    ],
                );
            });

            it(`last`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    2,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    ],
                );
            });
        });

        describe(`multiple lines, default mode to string mode`, () => {
            it(`first`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `"`,
                    0,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                    ],
                );
            });

            it(`middle`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `"`,
                    1,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.String, Lexer.LineMode.String, `charlie`],
                    ],
                );
            });

            it(`last`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `"`,
                    2,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.String, `"`],
                    ],
                );
            });
        });

        describe(`multiple lines, string mode to default mode`, () => {
            it(`first`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    0,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                    ],
                );
            });

            it(`middle`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    1,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `charlie`],
                    ],
                );
            });

            it(`last`, () => {
                expectLexerUpdateLineAlphaBravoCharlie(
                    `foobar`,
                    2,
                    [
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `alpha`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `bravo`],
                        [Lexer.LineKind.Touched, Lexer.LineMode.Default, Lexer.LineMode.Default, `foobar`],
                    ],
                );
            });
        });
    });
});
