// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Option } from "../common/option";
import { TokenKind } from "../lexer/token";
import { TokenRange } from "./tokenRange";

export namespace Ast {

    export const enum NodeKind {
        ArithmeticExpression = "ArithmeticExpression",
        AsExpression = "AsExpression",
        AsNullablePrimitiveType = "AsNullablePrimitiveType",
        AsType = "AsType",
        Constant = "Constant",
        Csv = "Csv",
        EachExpression = "EachExpression",
        EqualityExpression = "EqualityExpression",
        ErrorHandlingExpression = "ErrorHandlingExpression",
        ErrorRaisingExpression = "ErrorRaisingExpression",
        FieldProjection = "FieldProjection",
        FieldSelector = "FieldSelector",
        FieldSpecification = "FieldSpecification",
        FieldSpecificationList = "FieldSpecificationList",
        FieldTypeSpecification = "FieldTypeSpecification",
        FunctionExpression = "FunctionExpression",
        FunctionType = "FunctionType",
        GeneralizedIdentifier = "GeneralizedIdentifier",
        GeneralizedIdentifierPairedAnyLiteral = "GeneralizedIdentifierPairedAnyLiteral",
        GeneralizedIdentifierPairedExpression = "GeneralizedIdentifierPairedExpression",
        Identifier = "Identifier",
        IdentifierExpression = "IdentifierExpression",
        IdentifierExpressionPairedExpression = "IdentifierExpressionPairedExpression",
        IdentifierPairedExpression = "IdentifierPairedExpression",
        IfExpression = "IfExpression",
        InvokeExpression = "InvokeExpression",
        IsExpression = "IsExpression",
        ItemAccessExpression = "ItemAccessExpression",
        LetExpression = "LetExpression",
        ListExpression = "ListExpression",
        ListLiteral = "ListLiteral",
        ListType = "ListType",
        LiteralExpression = "LiteralExpression",
        LogicalExpression = "LogicalExpression",
        MetadataExpression = "MetadataExpression",
        NotImplementedExpression = "NotImplementedExpression",
        NullablePrimitiveType = "NullablePrimitiveType",
        NullableType = "NullableType",
        OtherwiseExpression = "OtherwiseExpression",
        Parameter = "Parameter",
        ParameterList = "ParameterList",
        ParenthesizedExpression = "ParenthesizedExpression",
        PrimitiveType = "PrimitiveType",
        RecordExpression = "RecordExpression",
        RecordLiteral = "RecordLiteral",
        RecordType = "RecordType",
        RecursivePrimaryExpression = "RecursivePrimaryExpression",
        RelationalExpression = "RelationalExpression",
        Section = "Section",
        SectionMember = "SectionMember",
        TableType = "TableType",
        TypePrimaryType = "TypePrimaryType",
        UnaryExpression = "UnaryExpression",
        UnaryExpressionHelper = "UnaryExpressionHelper",
    }

    // -------------------------------------
    // ---------- INode and TNode ----------
    // -------------------------------------

    export interface INode {
        readonly kind: NodeKind,
        readonly tokenRange: TokenRange,
        readonly terminalNode: boolean,
    }

    export type TNode = (
        | TDocument
        | TAuxiliaryNodes
    );

    // ----------------------------------------
    // ---------- Non-standard Nodes ----------
    // ----------------------------------------
    // These don't fit into a standard node hierarchy,
    // but are still considered a TNode.

    export type TAuxiliaryNodes = (
        | Constant
        | FieldSpecification
        | FieldSpecificationList
        | FieldTypeSpecification
        | GeneralizedIdentifier
        | Identifier
        | Parameter<TParameterType>
        | SectionMember
        | TAnyLiteral
        | TCsv
        | TKeyValuePair
        | TNullablePrimitiveType
        | TPairedConstant
        | TParameterList
        | TType
        | TUnaryExpressionHelper
        | TWrapped
    );

    export type TCsv = (
        | ICsv<FieldSelector>
        | ICsv<FieldSpecification>
        | ICsv<GeneralizedIdentifierPairedAnyLiteral>
        | ICsv<GeneralizedIdentifierPairedExpression>
        | ICsv<IdentifierPairedExpression>
        | ICsv<Parameter<TParameterType>>
        | ICsv<TAnyLiteral>
        | ICsv<TExpression>
    );

    export type TParameterList = ParameterList<TParameterType>;

    export type TRecursivePrimaryExpression = (
        | RecursivePrimaryExpression
        | InvokeExpression
        | ItemAccessExpression
        | TFieldAccessExpression
    );

    // -----------------------------------
    // ---------- Node subtypes ----------
    // -----------------------------------

    export type TBinOpExpression = (
        | ArithmeticExpression
        | EqualityExpression
        | LogicalExpression
        | RelationalExpression
    );
    export type TBinOpExpressionNodeKind = (
        | NodeKind.ArithmeticExpression
        | NodeKind.EqualityExpression
        | NodeKind.LogicalExpression
        | NodeKind.RelationalExpression
    )

    export type TBinOpKeywordExpression = (
        | IsExpression
        | AsExpression
        | MetadataExpression
    )
    export type TBinOpKeywordNodeKind = (
        | NodeKind.IsExpression
        | NodeKind.AsExpression
        | NodeKind.MetadataExpression
    )

    export type TKeyValuePair = (
        | GeneralizedIdentifierPairedAnyLiteral
        | GeneralizedIdentifierPairedExpression
        | IdentifierExpressionPairedExpression
        | IdentifierPairedExpression
    )
    export type TKeyValuePairNodeKind = (
        | NodeKind.GeneralizedIdentifierPairedAnyLiteral
        | NodeKind.GeneralizedIdentifierPairedExpression
        | NodeKind.IdentifierExpressionPairedExpression
        | NodeKind.IdentifierPairedExpression
    )

    export type TPairedConstant = (
        | AsNullablePrimitiveType
        | AsType
        | EachExpression
        | ErrorRaisingExpression
        | NullablePrimitiveType
        | NullableType
        | OtherwiseExpression
        | TypePrimaryType
    )
    export type TPairedConstantNodeKind = (
        | NodeKind.AsNullablePrimitiveType
        | NodeKind.AsType
        | NodeKind.EachExpression
        | NodeKind.ErrorRaisingExpression
        | NodeKind.NullablePrimitiveType
        | NodeKind.NullableType
        | NodeKind.OtherwiseExpression
        | NodeKind.TypePrimaryType
    )

    export type TWrapped = (
        // TWrapped where Content is TCsv[] and no extra attributes
        | InvokeExpression
        | ListExpression
        | ListLiteral
        | RecordExpression
        | RecordLiteral
        | TParameterList

        | FieldProjection
        | FieldSelector
        | FieldSpecificationList
        | ItemAccessExpression
        | ListType
        | ParenthesizedExpression
    );
    export type TWrappedNodeKind = (
        | NodeKind.FieldProjection
        | NodeKind.FieldSelector
        | NodeKind.FieldSpecificationList
        | NodeKind.InvokeExpression
        | NodeKind.ItemAccessExpression
        | NodeKind.ListExpression
        | NodeKind.ListLiteral
        | NodeKind.ListType
        | NodeKind.ParameterList
        | NodeKind.ParenthesizedExpression
        | NodeKind.RecordExpression
        | NodeKind.RecordLiteral
    )

    // --------------------------------------
    // ---------- 12.2.1 Documents ----------
    // --------------------------------------

    export type TDocument = (
        | Section
        | TExpression
    );

    // ----------------------------------------------
    // ---------- 12.2.2 Section Documents ----------
    // ----------------------------------------------

    export interface Section extends INode {
        readonly kind: NodeKind.Section,
        readonly terminalNode: false,
        readonly maybeLiteralAttributes: Option<RecordLiteral>,
        readonly sectionConstant: Constant,
        readonly maybeName: Option<Identifier>,
        readonly semicolonConstant: Constant,
        readonly sectionMembers: ReadonlyArray<SectionMember>,
    }

    export interface SectionMember extends INode {
        readonly kind: NodeKind.SectionMember,
        readonly terminalNode: false,
        readonly maybeLiteralAttributes: Option<RecordLiteral>,
        readonly maybeSharedConstant: Option<Constant>,
        readonly namePairedExpression: IdentifierPairedExpression,
        readonly semicolonConstant: Constant,
    }

    // ------------------------------------------
    // ---------- 12.2.3.1 Expressions ----------
    // ------------------------------------------

    export type TExpression = (
        | TLogicalExpression
        | EachExpression
        | FunctionExpression
        | LetExpression
        | IfExpression
        | ErrorRaisingExpression
        | ErrorHandlingExpression
    );

    // --------------------------------------------------
    // ---------- 12.2.3.2 Logical expressions ----------
    // --------------------------------------------------

    export type TLogicalExpression = (
        | LogicalExpression
        | TIsExpression
    );

    export interface LogicalExpression extends IBinOpExpression<NodeKind.LogicalExpression, LogicalOperator, TLogicalExpression> { };

    export const enum LogicalOperator {
        And = "and",
        Or = "or",
    }

    export function logicalOperatorFrom(maybeTokenKind: Option<TokenKind>): Option<LogicalOperator> {
        switch (maybeTokenKind) {
            case TokenKind.KeywordAnd: return LogicalOperator.And;
            case TokenKind.KeywordOr: return LogicalOperator.Or;
            default: return undefined;
        }
    }

    // --------------------------------------------
    // ---------- 12.2.3.3 Is expression ----------
    // --------------------------------------------

    export type TIsExpression = (
        | IsExpression
        | TAsExpression
    );

    export type TNullablePrimitiveType = (
        | NullablePrimitiveType
        | PrimitiveType
    )

    export interface IsExpression extends IBinOpKeyword<NodeKind.IsExpression, TAsExpression, TNullablePrimitiveType> { }

    export interface NullablePrimitiveType extends IPairedConstant<NodeKind.NullablePrimitiveType, PrimitiveType> { }

    export interface PrimitiveType extends INode {
        readonly kind: NodeKind.PrimitiveType,
        readonly terminalNode: false,
        readonly primitiveType: Constant,
    }

    // --------------------------------------------
    // ---------- 12.2.3.4 As expression ----------
    // --------------------------------------------

    export type TAsExpression = (
        | AsExpression
        | TEqualityExpression
    );

    export interface AsExpression extends IBinOpKeyword<NodeKind.AsExpression, TEqualityExpression, TNullablePrimitiveType> { }

    // --------------------------------------------------
    // ---------- 12.2.3.5 Equality expression ----------
    // --------------------------------------------------

    export type TEqualityExpression = (
        | EqualityExpression
        | TRelationalExpression
    );

    export interface EqualityExpression extends IBinOpExpression<NodeKind.EqualityExpression, EqualityOperator, TEqualityExpression> { };

    export const enum EqualityOperator {
        EqualTo = "=",
        NotEqualTo = "<>",
    }

    export function equalityOperatorFrom(maybeTokenKind: Option<TokenKind>): Option<EqualityOperator> {
        switch (maybeTokenKind) {
            case TokenKind.Equal: return EqualityOperator.EqualTo;
            case TokenKind.NotEqual: return EqualityOperator.NotEqualTo;
            default: return undefined;
        }
    }

    // ----------------------------------------------------
    // ---------- 12.2.3.6 Relational expression ----------
    // ----------------------------------------------------

    export type TRelationalExpression = (
        | RelationalExpression
        | TArithmeticExpression
    );

    export interface RelationalExpression extends IBinOpExpression<NodeKind.RelationalExpression, RelationalOperator, TRelationalExpression> { };

    export const enum RelationalOperator {
        LessThan = "<",
        LessThanEqualTo = "<=",
        GreaterThan = ">",
        GreaterThanEqualTo = ">=",
    }

    export function relationalOperatorFrom(maybeTokenKind: Option<TokenKind>): Option<RelationalOperator> {
        switch (maybeTokenKind) {
            case TokenKind.LessThan: return RelationalOperator.LessThan;
            case TokenKind.LessThanEqualTo: return RelationalOperator.LessThanEqualTo;
            case TokenKind.GreaterThan: return RelationalOperator.GreaterThan;
            case TokenKind.GreaterThanEqualTo: return RelationalOperator.GreaterThanEqualTo;
            default: return undefined;
        }
    }

    // -----------------------------------------------------
    // ---------- 12.2.3.7 Arithmetic expressions ----------
    // -----------------------------------------------------

    export type TArithmeticExpression = (
        | ArithmeticExpression
        | TMetadataExpression
    )

    export interface ArithmeticExpression extends IBinOpExpression<NodeKind.ArithmeticExpression, ArithmeticOperator, TArithmeticExpression> { };

    export const enum ArithmeticOperator {
        Multiplication = "*",
        Division = "/",
        Addition = "+",
        Subtraction = "-",
        And = "&",
    }

    export function arithmeticOperatorFrom(maybeTokenKind: Option<TokenKind>): Option<ArithmeticOperator> {
        switch (maybeTokenKind) {
            case TokenKind.Asterisk: return ArithmeticOperator.Multiplication;
            case TokenKind.Division: return ArithmeticOperator.Division;
            case TokenKind.Plus: return ArithmeticOperator.Addition;
            case TokenKind.Minus: return ArithmeticOperator.Subtraction;
            case TokenKind.Ampersand: return ArithmeticOperator.And;
            default: return undefined;
        }
    }

    // --------------------------------------------------
    // ---------- 12.2.3.8 Metadata expression ----------
    // --------------------------------------------------

    export type TMetadataExpression = (
        | MetadataExpression
        | TUnaryExpression
    );

    export interface MetadataExpression extends IBinOpKeyword<NodeKind.MetadataExpression, TUnaryExpression, TUnaryExpression> { }

    // -----------------------------------------------
    // ---------- 12.2.3.9 Unary expression ----------
    // -----------------------------------------------

    export type TUnaryExpression = (
        | UnaryExpression
        | TTypeExpression
    );

    export interface UnaryExpression extends INode {
        readonly kind: NodeKind.UnaryExpression,
        readonly terminalNode: false,
        readonly expressions: ReadonlyArray<UnaryExpressionHelper<UnaryOperator, TUnaryExpression>>,
    }

    export const enum UnaryOperator {
        Positive = "+",
        Negative = "-",
        Not = "not",
    }

    export function unaryOperatorFrom(maybeTokenKind: Option<TokenKind>): Option<UnaryOperator> {
        switch (maybeTokenKind) {
            case TokenKind.Plus: return UnaryOperator.Positive;
            case TokenKind.Minus: return UnaryOperator.Negative;
            case TokenKind.KeywordNot: return UnaryOperator.Not;
            default: return undefined;
        }
    }

    // --------------------------------------------------
    // ---------- 12.2.3.10 Primary expression ----------
    // --------------------------------------------------

    export type TPrimaryExpression = (
        | LiteralExpression
        | ListExpression
        | RecordExpression
        | IdentifierExpression
        // SectionAccessExpression
        | ParenthesizedExpression
        | TFieldAccessExpression
        | TRecursivePrimaryExpression
        | NotImplementedExpression
    );

    // --------------------------------------------------
    // ---------- 12.2.3.11 Literal expression ----------
    // --------------------------------------------------

    export interface LiteralExpression extends INode {
        readonly kind: NodeKind.LiteralExpression,
        readonly terminalNode: true,
        readonly literal: string,
        readonly literalKind: LiteralKind,
    }

    export const enum LiteralKind {
        Logical = "Logical",
        Null = "Null",
        Numeric = "Numeric",
        Str = "Str",
        Record = "Record",
        List = "List",
    }

    // -----------------------------------------------------
    // ---------- 12.2.3.12 Identifier expression ----------
    // -----------------------------------------------------

    export interface IdentifierExpression extends INode {
        readonly kind: NodeKind.IdentifierExpression,
        readonly terminalNode: false,
        readonly maybeInclusiveConstant: Option<Constant>,
        readonly identifier: Identifier,
    }

    // --------------------------------------------------------
    // ---------- 12.2.3.14 Parenthesized expression ----------
    // --------------------------------------------------------

    export interface ParenthesizedExpression extends IWrapped<NodeKind.ParenthesizedExpression, TExpression> { }

    // ----------------------------------------------------------
    // ---------- 12.2.3.15 Not-implemented expression ----------
    // ----------------------------------------------------------

    export interface NotImplementedExpression extends INode {
        readonly kind: NodeKind.NotImplementedExpression,
        readonly terminalNode: false,
        readonly ellipsisConstant: Constant,
    }

    // -------------------------------------------------
    // ---------- 12.2.3.16 Invoke expression ----------
    // -------------------------------------------------

    export interface InvokeExpression extends IWrapped<NodeKind.InvokeExpression, ReadonlyArray<ICsv<TExpression>>> { }

    // -----------------------------------------------
    // ---------- 12.2.3.17 List expression ----------
    // -----------------------------------------------

    export interface ListExpression extends IWrapped<NodeKind.ListExpression, ReadonlyArray<ICsv<TExpression>>> { }

    // -------------------------------------------------
    // ---------- 12.2.3.18 Record expression ----------
    // -------------------------------------------------

    export interface RecordExpression extends IWrapped<NodeKind.RecordExpression, ReadonlyArray<ICsv<GeneralizedIdentifierPairedExpression>>> { }

    // ------------------------------------------------------
    // ---------- 12.2.3.19 Item access expression ----------
    // ------------------------------------------------------

    export interface ItemAccessExpression extends IWrapped<NodeKind.ItemAccessExpression, TExpression> {
        // located after closeWrapperConstant
        readonly maybeOptionalConstant: Option<Constant>,
    }

    // --------------------------------------------------------
    // ---------- 12.2.3.20 Field access expressions ----------
    // --------------------------------------------------------

    export type TFieldAccessExpression = (
        | FieldSelector
        | FieldProjection
    );

    export interface FieldSelector extends IWrapped<NodeKind.FieldSelector, GeneralizedIdentifier> {
        // located after closeWrapperConstant
        readonly maybeOptionalConstant: Option<Constant>,
    }

    export interface FieldProjection extends IWrapped<NodeKind.FieldProjection, ReadonlyArray<ICsv<FieldSelector>>> {
        // located after closeWrapperConstant
        readonly maybeOptionalConstant: Option<Constant>,
    }

    // ---------------------------------------------------
    // ---------- 12.2.3.22 Function expression ----------
    // ---------------------------------------------------

    export interface FunctionExpression extends INode {
        readonly kind: NodeKind.FunctionExpression,
        readonly terminalNode: false,
        readonly parameters: ParameterList<Option<AsNullablePrimitiveType>>,
        readonly maybeFunctionReturnType: Option<AsNullablePrimitiveType>,
        readonly fatArrowConstant: Constant,
        readonly expression: TExpression,
    }

    // -----------------------------------------------
    // ---------- 12.2.3.22 Each expression ----------
    // -----------------------------------------------

    export interface EachExpression extends IPairedConstant<NodeKind.EachExpression, TExpression> { }

    // ----------------------------------------------
    // ---------- 12.2.3.23 Let expression ----------
    // ----------------------------------------------

    export interface LetExpression extends INode {
        readonly kind: NodeKind.LetExpression,
        readonly letConstant: Constant,
        readonly variableList: ReadonlyArray<ICsv<IdentifierPairedExpression>>,
        readonly inConstant: Constant,
        readonly expression: TExpression,
    }

    // ---------------------------------------------
    // ---------- 12.2.3.24 If expression ----------
    // ---------------------------------------------

    export interface IfExpression extends INode {
        readonly kind: NodeKind.IfExpression,
        readonly terminalNode: false,
        readonly ifConstant: Constant,
        readonly condition: TExpression,
        readonly thenConstant: Constant,
        readonly trueExpression: TExpression,
        readonly elseConstant: Constant,
        readonly falseExpression: TExpression,
    }

    // -----------------------------------------------
    // ---------- 12.2.3.25 Type expression ----------
    // -----------------------------------------------

    export type TTypeExpression = (
        | TPrimaryExpression
        | TypePrimaryType
    );

    export type TType = (
        // Technically TExpression should be ParenthesizedExpression,
        // but I'm matching the Microsoft's official parser.
        | TExpression
        | TPrimaryType
    );

    export type TPrimaryType = (
        | PrimitiveType
        | FunctionType
        | ListType
        | NullableType
        | RecordType
        | TableType
    );

    export interface FunctionType extends INode {
        readonly kind: NodeKind.FunctionType,
        readonly terminalNode: false,
        readonly functionConstant: Constant,
        readonly parameters: ParameterList<AsType>,
        readonly functionReturnType: AsType,
    }

    export interface ListType extends IWrapped<NodeKind.ListType, TType> { }

    export interface NullableType extends IPairedConstant<NodeKind.NullableType, TType> { }

    export interface RecordType extends INode {
        readonly kind: NodeKind.RecordType,
        readonly terminalNode: false,
        readonly fields: FieldSpecificationList,
    }

    export interface TableType extends INode {
        readonly kind: NodeKind.TableType,
        readonly terminalNode: false,
        readonly tableConstant: Constant,
        readonly rowType: FieldSpecificationList | TPrimaryExpression,
    }

    // --------------------------------------------------------
    // ---------- 12.2.3.26 Error raising expression ----------
    // --------------------------------------------------------

    export interface ErrorRaisingExpression extends IPairedConstant<NodeKind.ErrorRaisingExpression, TExpression> { }

    // ---------------------------------------------------------
    // ---------- 12.2.3.27 Error handling expression ----------
    // ---------------------------------------------------------

    export interface ErrorHandlingExpression extends INode {
        readonly kind: NodeKind.ErrorHandlingExpression,
        readonly terminalNode: false,
        readonly tryConstant: Constant,
        readonly protectedExpression: TExpression,
        readonly maybeOtherwiseExpression: Option<OtherwiseExpression>,
    }

    export interface OtherwiseExpression extends IPairedConstant<NodeKind.OtherwiseExpression, TExpression> { }

    export interface RecursivePrimaryExpression extends INode {
        readonly kind: NodeKind.RecursivePrimaryExpression,
        readonly terminalNode: false,
        readonly head: TPrimaryExpression,
        readonly recursiveExpressions: ReadonlyArray<TRecursivePrimaryExpression>,
    }

    export interface TypePrimaryType extends IPairedConstant<NodeKind.TypePrimaryType, TPrimaryType> { }

    // -----------------------------------------------
    // ---------- 12.2.4 Literal Attributes ----------
    // -----------------------------------------------

    export type TAnyLiteral = (
        | ListLiteral
        | LiteralExpression
        | RecordLiteral
    )

    export interface ListLiteral extends IWrapped<NodeKind.ListLiteral, ReadonlyArray<ICsv<TAnyLiteral>>> {
        readonly literalKind: LiteralKind.List,
    }

    export interface RecordLiteral extends IWrapped<NodeKind.RecordLiteral, ReadonlyArray<ICsv<GeneralizedIdentifierPairedAnyLiteral>>> {
        readonly literalKind: LiteralKind.Record,
    }

    // -----------------------------------------
    // ---------- Abstract interfaces ----------
    // -----------------------------------------

    // IBinOpExpressions are expressed in terms of Operand followed by N <Operand, Operator> unary expressions.
    // 1 + 2 + 3 + 4 -> (1) (+ 2) (+ 3) (+ 4)
    export interface IBinOpExpression<NodeKindVariant, Operator, Operand> extends INode {
        readonly kind: NodeKindVariant & TBinOpExpressionNodeKind,
        readonly first: Operand,
        readonly rest: ReadonlyArray<UnaryExpressionHelper<Operator, Operand>>,
    }

    // BinOp expressions which uses a keyword as operators,
    // ex. `1 is number`
    export interface IBinOpKeyword<NodeKindVariant, L, R> extends INode {
        readonly kind: NodeKindVariant & TBinOpKeywordNodeKind,
        readonly left: L,
        readonly constant: Constant,
        readonly right: R,
    }

    export interface ICsv<T> extends INode {
        readonly kind: NodeKind.Csv
        readonly node: T,
        readonly maybeCommaConstant: Option<Constant>,
    }

    export interface IKeyValuePair<NodeKindVariant, Key, Value> extends INode {
        readonly kind: NodeKindVariant & TKeyValuePairNodeKind,
        readonly key: Key,
        readonly equalConstant: Constant,
        readonly value: Value,
    }

    // a (Constant, T) tuple
    // ex. EachExpression is a `each` Constant paired with a TExpression
    export interface IPairedConstant<NodeKindVariant, Paired> extends INode {
        readonly kind: NodeKindVariant & TPairedConstantNodeKind,
        readonly constant: Constant,
        readonly paired: Paired,
    }

    export interface IWrapped<NodeKindVariant, Content> extends INode {
        readonly kind: NodeKindVariant & TWrappedNodeKind,
        readonly openWrapperConstant: Constant,
        readonly content: Content,
        readonly closeWrapperConstant: Constant,
    }

    // -------------------------------------------
    // ---------- UnaryExpressionHelper ----------
    // -------------------------------------------

    // a (Operator, Operand) pair
    // used by unary and binary expressions
    export interface UnaryExpressionHelper<Operator, Operand> extends INode {
        readonly kind: NodeKind.UnaryExpressionHelper,
        readonly terminalNode: false,
        readonly inBinaryExpression: boolean,
        readonly operator: Operator,
        readonly operatorConstant: Constant,
        readonly node: Operand,
    }

    export type TUnaryExpressionHelper = (
        | UnaryExpressionHelper<ArithmeticOperator, TArithmeticExpression>
        | UnaryExpressionHelper<EqualityOperator, TEqualityExpression>
        | UnaryExpressionHelper<LogicalOperator, TLogicalExpression>
        | UnaryExpressionHelper<RelationalOperator, TRelationalExpression>
        | UnaryExpressionHelper<UnaryOperator, TUnaryExpression>
    )

    export type TUnaryExpressionHelperOperator = (
        | ArithmeticOperator
        | EqualityOperator
        | LogicalOperator
        | RelationalOperator
        | UnaryOperator
    )

    // ------------------------------------------
    // ---------- Key value pair nodes ----------
    // ------------------------------------------

    export interface GeneralizedIdentifierPairedAnyLiteral extends IKeyValuePair<NodeKind.GeneralizedIdentifierPairedAnyLiteral, GeneralizedIdentifier, TAnyLiteral> { };

    export interface GeneralizedIdentifierPairedExpression extends IKeyValuePair<NodeKind.GeneralizedIdentifierPairedExpression, GeneralizedIdentifier, TExpression> { };

    export interface IdentifierPairedExpression extends IKeyValuePair<NodeKind.IdentifierPairedExpression, Identifier, TExpression> { };

    export interface IdentifierExpressionPairedExpression extends IKeyValuePair<NodeKind.IdentifierExpressionPairedExpression, IdentifierExpression, TExpression> { };

    // ---------------------------------------
    // ---------- Parameter related ----------
    // ---------------------------------------

    export type TParameterType = (
        | AsType
        | Option<AsNullablePrimitiveType>
    )

    export interface ParameterList<T> extends IWrapped<NodeKind.ParameterList, ReadonlyArray<ICsv<Parameter<T>>>> { }

    export interface Parameter<T> extends INode {
        readonly kind: NodeKind.Parameter,
        readonly terminalNode: false,
        readonly maybeOptionalConstant: Option<Constant>,
        readonly name: Identifier,
        readonly maybeParameterType: T,
    }

    export interface AsNullablePrimitiveType extends IPairedConstant<NodeKind.AsNullablePrimitiveType, TNullablePrimitiveType> { }

    export interface AsType extends IPairedConstant<NodeKind.AsType, TType> { }

    // ----------------------------------------
    // ---------- Re-used interfaces ----------
    // ----------------------------------------

    export interface Constant extends INode {
        readonly kind: NodeKind.Constant,
        readonly terminalNode: true,
        readonly literal: string,
    }

    export interface FieldSpecification extends INode {
        readonly kind: NodeKind.FieldSpecification,
        readonly terminalNode: false,
        readonly maybeOptionalConstant: Option<Constant>,
        readonly name: GeneralizedIdentifier,
        readonly maybeFieldTypeSpeification: Option<FieldTypeSpecification>,
    }
    export interface FieldSpecificationList extends IWrapped<NodeKind.FieldSpecificationList, ReadonlyArray<ICsv<FieldSpecification>>> {
        // located between content and closeWrapperConstant
        readonly maybeOpenRecordMarkerConstant: Option<Constant>,
    }

    export interface FieldTypeSpecification extends INode {
        readonly kind: NodeKind.FieldTypeSpecification,
        readonly equalConstant: Constant,
        readonly fieldType: TType,
    }

    export interface GeneralizedIdentifier extends INode {
        readonly kind: NodeKind.GeneralizedIdentifier,
        readonly terminalNode: true,
        readonly literal: string,
    }

    export interface Identifier extends INode {
        readonly kind: NodeKind.Identifier,
        readonly terminalNode: true,
        readonly literal: string,
    }

    // ---------------------------------
    // ---------- const enums ----------
    // ---------------------------------

    export const enum ConstantKind {
        // TokenKind
        As = "as",
        AtSign = "@",
        Comma = ",",
        Each = "each",
        Ellipsis = "...",
        Else = "else",
        Equal = "=",
        Error = "error",
        FatArrow = "=>",
        If = "if",
        In = "in",
        Is = "is",
        Section = "section",
        Semicolon = ";",
        Shared = "shared",
        LeftBrace = "{",
        LeftBracket = "[",
        LeftParenthesis = "(",
        Let = "let",
        Meta = "meta",
        Null = "null",
        Otherwise = "otherwise",
        QuestionMark = "?",
        RightBrace = "}",
        RightBracket = "]",
        RightParenthesis = ")",
        Then = "then",
        Try = "try",
        Type = "type",

        // IdentifierConstant
        Any = "any",
        AnyNonNull = "anynonnull",
        Binary = "binary",
        Date = "date",
        DateTime = "datetime",
        DateTimeZone = "datetimezone",
        Duration = "duration",
        Function = "function",
        List = "list",
        Logical = "logical",
        None = "none",
        Nullable = "nullable",
        Number = "number",
        Optional = "optional",
        Record = "record",
        Table = "table",
        Text = "text",
        Time = "time",
    }

    export const enum IdentifierConstant {
        Any = "any",
        AnyNonNull = "anynonnull",
        Binary = "binary",
        Date = "date",
        DateTime = "datetime",
        DateTimeZone = "datetimezone",
        Duration = "duration",
        Function = "function",
        List = "list",
        Logical = "logical",
        None = "none",
        Nullable = "nullable",
        Number = "number",
        Optional = "optional",
        Record = "record",
        Table = "table",
        Text = "text",
        Time = "time",
    }

    // ---------------------------------------------------
    // ---------- string 2 const enum functions ----------
    // ---------------------------------------------------

    export function literalKindFrom(maybeTokenKind: Option<TokenKind>): Option<LiteralKind> {
        switch (maybeTokenKind) {
            case TokenKind.HexLiteral:
            case TokenKind.NumericLiteral:
                return LiteralKind.Numeric;

            case TokenKind.KeywordFalse:
            case TokenKind.KeywordTrue:
                return LiteralKind.Logical;

            case TokenKind.NullLiteral:
                return LiteralKind.Null;

            case TokenKind.StringLiteral:
                return LiteralKind.Str;

            default:
                return undefined;
        }
    }

    export function constantKindFromIdentifieConstant(identifierConstant: IdentifierConstant): Option<ConstantKind> {
        switch (identifierConstant) {
            case IdentifierConstant.Any: return ConstantKind.Any;
            case IdentifierConstant.AnyNonNull: return ConstantKind.AnyNonNull;
            case IdentifierConstant.Binary: return ConstantKind.Binary;
            case IdentifierConstant.Date: return ConstantKind.Date;
            case IdentifierConstant.DateTime: return ConstantKind.DateTime;
            case IdentifierConstant.DateTimeZone: return ConstantKind.DateTimeZone;
            case IdentifierConstant.Duration: return ConstantKind.Duration;
            case IdentifierConstant.Function: return ConstantKind.Function;
            case IdentifierConstant.List: return ConstantKind.List;
            case IdentifierConstant.Logical: return ConstantKind.Logical;
            case IdentifierConstant.None: return ConstantKind.None;
            case IdentifierConstant.Nullable: return ConstantKind.Nullable;
            case IdentifierConstant.Number: return ConstantKind.Number;
            case IdentifierConstant.Optional: return ConstantKind.Optional;
            case IdentifierConstant.Record: return ConstantKind.Record;
            case IdentifierConstant.Table: return ConstantKind.Table;
            case IdentifierConstant.Text: return ConstantKind.Text;
            case IdentifierConstant.Time: return ConstantKind.Time;
            default: return undefined;
        }
    }

    export function constantKindFromTokenKind(tokenKind: TokenKind): Option<ConstantKind> {
        switch (tokenKind) {
            case TokenKind.AtSign: return ConstantKind.AtSign;
            case TokenKind.Comma: return ConstantKind.Comma;
            case TokenKind.Ellipsis: return ConstantKind.Ellipsis;
            case TokenKind.Equal: return ConstantKind.Equal;
            case TokenKind.FatArrow: return ConstantKind.FatArrow;
            case TokenKind.KeywordAs: return ConstantKind.As;
            case TokenKind.KeywordEach: return ConstantKind.Each;
            case TokenKind.KeywordElse: return ConstantKind.Else;
            case TokenKind.KeywordError: return ConstantKind.Error;
            case TokenKind.KeywordIf: return ConstantKind.If;
            case TokenKind.KeywordIn: return ConstantKind.In;
            case TokenKind.KeywordIs: return ConstantKind.Is;
            case TokenKind.KeywordLet: return ConstantKind.Let;
            case TokenKind.KeywordMeta: return ConstantKind.Meta;
            case TokenKind.KeywordOtherwise: return ConstantKind.Otherwise;
            case TokenKind.KeywordSection: return ConstantKind.Section;
            case TokenKind.KeywordShared: return ConstantKind.Shared;
            case TokenKind.KeywordThen: return ConstantKind.Then;
            case TokenKind.KeywordTry: return ConstantKind.Try;
            case TokenKind.KeywordType: return ConstantKind.Type;
            case TokenKind.LeftBrace: return ConstantKind.LeftBrace;
            case TokenKind.LeftBracket: return ConstantKind.LeftBracket;
            case TokenKind.LeftParenthesis: return ConstantKind.LeftParenthesis;
            case TokenKind.NullLiteral: return ConstantKind.Null;
            case TokenKind.QuestionMark: return ConstantKind.QuestionMark;
            case TokenKind.RightBrace: return ConstantKind.RightBrace;
            case TokenKind.RightBracket: return ConstantKind.RightBracket;
            case TokenKind.RightParenthesis: return ConstantKind.RightParenthesis;
            case TokenKind.Semicolon: return ConstantKind.Semicolon;
            default: return undefined;
        }
    }

    // -----------------------------------
    // ---------- isX functions ----------
    // -----------------------------------

    export function isIdentifierConstant(maybeIdentifierConstant: string): maybeIdentifierConstant is IdentifierConstant {
        switch (maybeIdentifierConstant) {
            case IdentifierConstant.Any:
            case IdentifierConstant.AnyNonNull:
            case IdentifierConstant.Binary:
            case IdentifierConstant.Date:
            case IdentifierConstant.DateTime:
            case IdentifierConstant.DateTimeZone:
            case IdentifierConstant.Duration:
            case IdentifierConstant.Function:
            case IdentifierConstant.List:
            case IdentifierConstant.Logical:
            case IdentifierConstant.None:
            case IdentifierConstant.Nullable:
            case IdentifierConstant.Number:
            case IdentifierConstant.Optional:
            case IdentifierConstant.Record:
            case IdentifierConstant.Table:
            case IdentifierConstant.Text:
            case IdentifierConstant.Time:
                return true
            default:
                return false;
        }
    }

    export function isTBinOpExpression(node: TNode): node is TBinOpExpression {
        switch (node.kind) {
            case NodeKind.ArithmeticExpression:
            case NodeKind.EqualityExpression:
            case NodeKind.LogicalExpression:
            case NodeKind.RelationalExpression:
                return true

            default:
                return false;
        }
    }

}
