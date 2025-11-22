import { Component, OnInit, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CommentService } from './comment.service';
import { CommentViewModel } from './comment.model';
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
  @ViewChild('commentFormSection') private commentFormRef?: ElementRef;

  protected readonly title = signal('Comment System');

  comments = signal<CommentViewModel[]>([]);
  totalPagesArray = signal<number[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  replyingToId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  loadingError = signal<string | null>(null);

  constructor(private commentService: CommentService) {
    effect(() => {
      const id = this.replyingToId();
      if (id !== null) {
        setTimeout(() => {
          this.scrollToForm();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.loadComments();
  }

  private scrollToForm(): void {
    if (this.commentFormRef?.nativeElement) {
      this.commentFormRef.nativeElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    } else {
      console.warn('Form element not found. Check #commentFormSection in HTML.');
    }
  }

  updateTotalPagesArray(): void {
    const pages = Array.from({ length: this.totalPages() }, (_, i) => i + 1);
    this.totalPagesArray.set(pages);
  }

  loadComments(page: number = 1): void {
    this.currentPage.set(page);
    this.isLoading.set(true);
    this.loadingError.set(null);

    this.commentService.getComments(page).subscribe({
      next: (response) => {
        if (response?.comments && response?.totalPages != null) {
          this.comments.set(response.comments);
          this.totalPages.set(response.totalPages);  
          this.updateTotalPagesArray(); 
        } else {
          this.loadingError.set('Invalid server response.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loadingError.set(err?.message || 'Failed to load comments.');
        this.isLoading.set(false);
      }
    });
  }

  onCommentAdded(): void {
    this.replyingToId.set(null);
    this.loadComments();
  }

  onReplyTo(commentId: number | null): void {  
    this.replyingToId.set(this.replyingToId() === commentId ? null : commentId);
  }
}
