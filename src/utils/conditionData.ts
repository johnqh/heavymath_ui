/**
 * @fileoverview Condition Data Utilities
 * @description Re-exports condition encoding/decoding from shared types
 * and adds UI-specific helpers for form ↔ condition conversion.
 */

export {
  ConditionType,
  ScoreType,
  TeamSide,
  ComparisonOperator,
  encodeConditionData,
  decodeConditionData,
  formatConditionDescription,
} from "@sudobility/heavymath_types";

export type {
  ConditionData,
  ConditionTypeValue,
  ScoreTypeValue,
  TeamSideValue,
  ComparisonOperatorValue,
  WinLossCondition,
  MatchScoreCondition,
  TournamentCondition,
} from "@sudobility/heavymath_types";
