export interface Comment {
  userName: string;
  email: string;
  textMessage: string;
  parentCommentId?: number;
  dNTCaptchaText: string;
  dNTCaptchaInputText: string;
  dNTCaptchaToken: string;
  attachedFile?: File;
  homePage?: string;
}

export interface CaptchaResponse {
  dntCaptchaImgUrl: string;
  dntCaptchaId: string;
  dntCaptchaTextValue: string;
  dntCaptchaTokenValue: string;
}

export interface CommentViewModel {
  id: number;
  userName: string;
  email: string;
  textMessage: string;
  createdAt: Date;
  homePage?: string;
  filePath?: string;
  parentCommentId?: number;
  fullFileUrl?: string | null;
  isImage?: boolean;
}

export interface CommentListResponse {
  comments: CommentViewModel[];
  totalPages: number;
}

export interface RepliesResponse {
  replies: CommentViewModel[];
  totalCount: number;
}

