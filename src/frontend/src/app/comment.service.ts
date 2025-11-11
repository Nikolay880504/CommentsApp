
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { Comment, CaptchaResponse, CommentViewModel } from './comment.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly commentsUrl = `${environment.apiUrl}/comment`;
  private readonly captchaParamsUrl = `${environment.apiUrl}/captcha/params`;
  private readonly captchaImageUrlEndpoint = `${environment.apiUrl}/captcha/image`;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  getCaptcha(): Observable<CaptchaResponse> {
    return this.http.get<CaptchaResponse>(this.captchaParamsUrl).pipe(
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

    return this.http.post<Comment>(this.commentsUrl, formData, { withCredentials: true });
  }

  getComments(): Observable<CommentViewModel[]> {
    const mockComments: CommentViewModel[] = [
      {
        id: 3,
        userName: 'User2',
        email: 'user2@example.com',
        textMessage: 'Еще один заглавный комментарий.',
        date: new Date().toISOString(),
        parentCommentId: undefined,
        attachedFileUrl: 'https://example.com/image.png',
        attachedFileType: 'image'
      }
    ];

    return of(mockComments).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка при получении комментариев:', error);
        return throwError(() => error);
      })
    );
  }
}
