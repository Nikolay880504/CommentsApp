
export interface Comment {

  userName: string;       
  email: string;            
  textMessage: string;        
  parentCommentId?: number; 
  dNTCaptchaText: string;   
  dNTCaptchaInputText: string;  
  dNTCaptchaToken: string; 
  attachedFile?: File;
 // __RequestVerificationToken?: string; // Токен для CSRF
 
  homePage?: string;         
}

export interface CaptchaResponse {

    dntCaptchaImgUrl: string;
    dntCaptchaId: string;
    dntCaptchaTextValue: string; 
    dntCaptchaTokenValue: string;
    __RequestVerificationToken?: string; 
}
export interface CommentViewModel {
  id: number;
  userName: string;
  email: string;
  textMessage: string;
  date: string;                
  homePage?: string;
  attachedFileUrl?: string;
  attachedFileType?: 'image' | 'text';
  parentCommentId?: number;   
}

