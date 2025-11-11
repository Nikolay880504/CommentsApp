// comment-form.component.ts

// comment-form.component.ts

import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../comment.service';
import { Comment } from '../../comment.model';
import { finalize, catchError, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent implements OnInit, OnChanges {
  @Output() commentAdded = new EventEmitter<Comment>();
  @Output() formReset = new EventEmitter<void>();

  @Input() parentCommentId: number | null = 0;

  commentForm: FormGroup;
  isLoading = false;
  submitError: string | null = null;
  submissionMessage: string | null = null;

  captchaImageUrl: SafeUrl | null = null;
  captchaHiddenText: string = '';
  captchaHiddenToken: string = '';
  requestVerificationToken: string = '';

  selectedFile: File | null = null;
  filePreviewUrl: SafeUrl | null = null;
  fileError: string | null = null;

  private readonly MAX_IMAGE_WIDTH = 320;
  private readonly MAX_IMAGE_HEIGHT = 240;
  private readonly MAX_TEXT_FILE_SIZE = 102400; // 100 КБ

  private readonly USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
  private readonly URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  private readonly CAPTCHA_REGEX = /^[0-9]{4}$/;
  private readonly ALLOWED_TAGS = ['A', 'CODE', 'I', 'STRONG'];

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private sanitizer: DomSanitizer,
    //private http: HttpClient
  ) {
    this.commentForm = this.fb.group({
      userName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(this.USERNAME_REGEX)]],
      email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
      homePage: ['', [Validators.maxLength(250), this.urlValidator.bind(this)]],
      textMessage: ['', [Validators.required, Validators.maxLength(4096)]],
      captchaInputText: ['', [Validators.required, Validators.pattern(this.CAPTCHA_REGEX), Validators.minLength(4), Validators.maxLength(4)]]
    });
  }

  ngOnInit(): void {
    this.loadNewCaptcha();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentCommentId'] && changes['parentCommentId'].currentValue === null) {
      // При необходимости можно сбросить форму
      // this.resetFormState();
    }
  }

  getControl(name: string) {
    return this.commentForm.get(name);
  }

  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return this.URL_REGEX.test(control.value) ? null : { pattern: true, url: true };
  }

  public loadNewCaptcha(): void {
    this.isLoading = true;
    this.submitError = null;
    this.captchaImageUrl = null;
    this.commentForm.patchValue({ captchaInputText: '' });

    this.commentService.getCaptcha().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.captchaImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.dntCaptchaImgUrl);
        this.captchaHiddenText = response.dntCaptchaTextValue;
        this.captchaHiddenToken = response.dntCaptchaTokenValue;
        this.requestVerificationToken = response.__RequestVerificationToken || '';
        this.submitError = null;
  
      },
      error: (err: HttpErrorResponse) => {
        console.error('Ошибка при загрузке CAPTCHA:', err);
        this.submitError = 'Не удалось загрузить CAPTCHA с сервера.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return this.clearFile();

    const file = input.files[0];
    this.selectedFile = file;
    this.fileError = null;
    this.filePreviewUrl = null;

    if (file.type.startsWith('image/')) {
      const validImageFormats = ['image/jpeg', 'image/gif', 'image/png'];
      if (!validImageFormats.includes(file.type)) return this.setFileError('Недопустимый формат изображения. JPG, GIF, PNG.');
      this.resizeImage(file);
    } else if (file.type === 'text/plain') {
      if (file.size > this.MAX_TEXT_FILE_SIZE) return this.setFileError(`Текстовый файл не должен превышать ${this.MAX_TEXT_FILE_SIZE / 1024} КБ.`);
      this.fileError = 'Текстовый файл загружен (макс. 100 КБ).';
    } else {
      this.setFileError('Неподдерживаемый тип файла. JPG, GIF, PNG или TXT.');
    }
  }

  private setFileError(message: string) {
    this.fileError = message;
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }

  private resizeImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        let ratio = Math.min(this.MAX_IMAGE_WIDTH / width, this.MAX_IMAGE_HEIGHT / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL(file.type);
          this.filePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(resizedDataUrl);
          this.selectedFile = this.dataURLtoFile(resizedDataUrl, file.name);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.fileError = null;
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  private sanitizeText(text: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const processNode = (node: Node) => {
      if (node.nodeType === 1) {
        const tagName = (node as HTMLElement).tagName;
        if (!this.ALLOWED_TAGS.includes(tagName)) {
          while (node.firstChild) node.parentNode?.insertBefore(node.firstChild, node);
          node.parentNode?.removeChild(node);
        } else {
          if (tagName === 'A') {
            const el = node as HTMLAnchorElement;
            const href = el.getAttribute('href') || '';
            if (!href || href.startsWith('javascript:')) el.removeAttribute('href');
            else { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
          }
          Array.from(node.childNodes).forEach(processNode);
        }
      } else if (node.nodeType !== 3) node.parentNode?.removeChild(node);
    };

    Array.from(tempDiv.childNodes).forEach(processNode);
    return tempDiv.innerHTML;
  }

  onSubmit(): void {
    this.submitError = null;
    this.submissionMessage = null;
    this.commentForm.markAllAsTouched();

    if (this.commentForm.invalid) {
      this.submitError = 'Пожалуйста, заполните все обязательные поля корректно.';
      return;
    }

    const formValue = this.commentForm.value;
    
    const comment: Comment = {
    userName: formValue.userName,
    email: formValue.email,
    textMessage: this.sanitizeText(formValue.textMessage),
    homePage: formValue.homePage || undefined,
    dNTCaptchaText: this.captchaHiddenText,
    dNTCaptchaToken: this.captchaHiddenToken,
    dNTCaptchaInputText: formValue.captchaInputText
  };

  if (this.parentCommentId !== null) {
    comment.parentCommentId = this.parentCommentId;
  }

  if (this.selectedFile) {
    comment.attachedFile = this.selectedFile; 
  }
 
   this.commentService.addComment(comment).pipe(
  catchError(err => {
    this.submitError = 'Ошибка при отправке комментария. Попробуйте позже.';
    console.error('Submission error:', err);
    return throwError(() => new Error('Submission failed'));
  })
).subscribe({
  next: (res) => {
    this.submissionMessage = 'Комментарий успешно отправлен!';
    this.resetFormState();
    this.commentAdded.emit(res);
  }
});
  }

  private resetFormState(): void {
    this.commentForm.reset({
      UserName: '',
      Email: '',
      homePage: '',
      Text: '',
      captchaInputText: ''
    });
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.fileError = null;
    this.loadNewCaptcha();
    this.formReset.emit();
  }

  get c() {
    return this.commentForm.controls;
  }
}
