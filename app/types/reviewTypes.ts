export interface AnswerSegment {
  text: string;
  type: "correct" | "incorrect" | "missing" | "none";
}

export interface SegmentResult extends AnswerSegment {
  index: number;
}