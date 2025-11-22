
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { Comment, CaptchaResponse, CommentViewModel, CommentListResponse, RepliesResponse } from './comment.model';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseHost = environment.apiHost;
  private readonly addCommentsUrl = `${this.baseHost}/api/comment`;
  private readonly captchaParamsUrl = `${this.baseHost}/api/captcha/params`;
  private readonly getCommentsUrl = `${this.baseHost}/api/comment/pageIndex`;
  constructor(private http: HttpClient) {}
    
 getCaptcha(): Observable<CaptchaResponse> {
  return this.http.get<CaptchaResponse>(this.captchaParamsUrl, { withCredentials: true }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Ошибка при получении CAPTCHA:', error);
      return throwError(() => error);
    })
  );
}

  addComment(data: Comment): Observable<Comment> {
    const formData = new FormData();

    formData.append('UserName', data.userName);
    formData.append('Email', data.email);
    formData.append('TextMessage', data.textMessage);

    if (data.parentCommentId != null) { 
      formData.append('ParentCommentId', data.parentCommentId.toString());
    }

    if (data.homePage) {
      formData.append('HomePage', data.homePage);
    }

    formData.append('DNTCaptchaToken', data.dNTCaptchaToken);
    formData.append('DNTCaptchaText', data.dNTCaptchaText);
    formData.append('DNTCaptchaInputText', data.dNTCaptchaInputText.trim());

    if (data.attachedFile) {
      formData.append('UploadedFile', data.attachedFile, data.attachedFile.name);
    }

    return this.http.post<Comment>(this.addCommentsUrl, formData, { withCredentials: true });
  }
  downloadFile(fileName: string) {
    const url = `${this.baseHost}/api/comment/download/${fileName}`;
    return this.http.get(url, { responseType: 'blob' });
  }

getReplies(id: number, skip: number, take: number): Observable<RepliesResponse> {
  const url = `${this.baseHost}/api/comment/replies/${id}?skip=${skip}&take=${take}`;

  return this.http.get<RepliesResponse>(url).pipe(
    map(response => {
      response.replies.forEach(reply => {
        reply.createdAt = new Date(reply.createdAt + 'Z')
        if (reply.filePath) {          
          reply.fullFileUrl = `${this.baseHost}${reply.filePath}`;
          reply.isImage = this.isImageFile(reply.filePath);
        }
      });
      
      return response;
    }),
    catchError(err => {
      console.error('Ошибка при загрузке ответов:', err);
      return of({ replies: [], totalCount: 0 });
    })
  );
}

 getComments(pageIndex: number): Observable<CommentListResponse> {
    return this.http.get<CommentListResponse>(`${this.getCommentsUrl}/${pageIndex}`).pipe(
      map(response => {
        response.comments.forEach(c => {
          c.createdAt = new Date(c.createdAt + 'Z')
          if (c.filePath) {            
            c.fullFileUrl = `${this.baseHost}${c.filePath}`;
            c.isImage = this.isImageFile(c.filePath);
            console.log(c.fullFileUrl);

          }
        });
        return response;
      }),
      catchError(error => {
        console.error('Ошибка при получении комментариев', error);
        return of({ comments: [], totalPages: 1 } as CommentListResponse);
      })
    );
  }

  private isImageFile(filePath: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
  }
}

