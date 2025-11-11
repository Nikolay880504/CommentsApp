import { Component, OnInit, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CommentService } from './comment.service';
import { Comment, CommentViewModel } from './comment.model';
import { CommentFormComponent } from './comments/comment-form/comment-form.component';
import { CommentListComponent } from './comments/comment-list/comment-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CommentFormComponent,
    CommentListComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  providers: [CommentService]
})

export class App implements OnInit {
  @ViewChild('commentFormSection') private commentFormRef!: ElementRef;
  protected readonly title = signal('Система Комментариев');
  comments = signal<CommentViewModel[]>([]);
  replyingToId = signal<number | null>(null);


  isLoading = signal<boolean>(false);
  loadingError = signal<string | null>(null);

  constructor(private commentService: CommentService) {
    effect(() => {
      if (this.replyingToId() !== null) {
        setTimeout(() => {
          this.commentFormRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.loadingError.set(null);

    this.commentService.getComments().subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки комментариев:', err);
        this.loadingError.set('Не удалось загрузить комментарии. Пожалуйста, проверьте подключение.');
        this.isLoading.set(false);
      }
    });
  }

  onCommentAdded(): void {
    this.replyingToId.set(null);
    this.loadComments();
  }

  onReplyTo(commentId: number | null): void {
    
    if (this.replyingToId() === commentId) {
      this.replyingToId.set(null);
    } else {
      this.replyingToId.set(commentId);
    }
  }
}
