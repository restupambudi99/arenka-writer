export type BookKind = "fiction" | "nonfiction";

export type PageOrientation = "portrait" | "landscape";

export type BookStage = "blueprint" | "outline" | "manuscript" | "preview";

export type ApprovalStatus = "draft" | "in_review" | "approved";

export interface BookLayout {
  pageSize: "A4" | "A5" | "B5" | "B6" | "custom";
  customWidthMm?: number;
  customHeightMm?: number;
  orientation: PageOrientation;
  bodyFont: string;
  bodyFontSizePt: number;
  headingFont: string;
  pageNumberStyle: "none" | "arabic" | "roman_front_matter";
  tableOfContentsStyle: "none" | "labeled" | "digits" | "dotted_leader";
}

export interface Book {
  id: string;
  ownerId: string;
  voiceProfileId: string;
  voiceProfileVersion: number;
  kind: BookKind;
  title: string;
  summary: string;
  targetWordCount: number;
  stage: BookStage;
  archivedAt: string | null;
  layout: BookLayout;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  position: number;
  title: string;
  purpose: string;
  currentRevisionId: string | null;
  approvalStatus: ApprovalStatus;
  approvedRevisionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterRevision {
  id: string;
  chapterId: string;
  revisionNumber: number;
  content: string;
  source: "manual" | "ai_suggestion" | "import" | "restore";
  restoredFromRevisionId?: string | null;
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  bookId: string;
  format: "pdf";
  sourceRevisionIds: string[];
  r2ObjectKey: string;
  createdAt: string;
}

