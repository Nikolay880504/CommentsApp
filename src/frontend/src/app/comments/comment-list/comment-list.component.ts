import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommentViewModel } from '../../comment.model';
import { CommentService } from '../../comment.service';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';

interface CommentNode extends CommentViewModel {
  replies?: CommentNode[];
  hasMoreReplies?: boolean;
  loadedRepliesCount: number;
  isThreadOpen?: boolean;
  totalReplies: number;
  showDiscussionButton?: boolean;
}

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnChanges {
  sortField: 'userName' | 'email' | 'createdAt' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  @Input() allComments: CommentViewModel[] = [];
  @Input() replyingToId: number | null = 0;

  @Output() replyTo = new EventEmitter<number>();

  lightboxImage: string | null = null;
  public hierarchicalComments: CommentNode[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private commentService: CommentService
  ) {}

  openImage(url: string) {
    this.lightboxImage = url;
  }

  closeImage() {
    this.lightboxImage = null;
  }

  setSort(field: 'userName' | 'email' | 'createdAt') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.ngOnChanges({
      allComments: { currentValue: this.allComments, previousValue: null, firstChange: false, isFirstChange: () => false }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allComments'] && this.allComments) {
      const sorted = [...this.allComments].sort((a, b) => {
        let valA: any = a[this.sortField];
        let valB: any = b[this.sortField];

        if (this.sortField === 'createdAt') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      this.hierarchicalComments = this.buildHierarchy(sorted);
    }
  }

  private buildHierarchy(comments: CommentViewModel[]): CommentNode[] {
    const commentMap = new Map<number, CommentNode>();
    const rootComments: CommentNode[] = [];

    comments.forEach(c => {
      const node: CommentNode = {
        ...c,
        replies: [],
        loadedRepliesCount: 0,
        totalReplies: 0,
        hasMoreReplies: false,
        isThreadOpen: false
      };
      commentMap.set(c.id, node);
    });

    commentMap.forEach(commentNode => {
      const parentId = commentNode.parentCommentId;
      if (parentId) {
        const parent = commentMap.get(parentId);
        if (parent) {
          parent.replies!.push(commentNode);
          parent.loadedRepliesCount = (parent.loadedRepliesCount ?? 0) + 1;
          parent.isThreadOpen = false;
          parent.hasMoreReplies = false;
          parent.totalReplies = 0;
          parent.showDiscussionButton = true;
        } else {
          rootComments.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  }

  downloadFile(fileUrl: string) {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    this.commentService.downloadFile(fileName).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  public loadMoreReplies(comment: CommentNode): void {
    const skip = comment.loadedRepliesCount ?? 0;
    const take = 10;

    this.commentService.getReplies(comment.id, skip, take)
      .subscribe(response => {
        comment.totalReplies = response.totalCount;
        response.replies.forEach(r => {
          comment.replies!.push({
            ...r,
            replies: [],
            loadedRepliesCount: 0,
            totalReplies: 0,
            hasMoreReplies: false,
            isThreadOpen: false,
            showDiscussionButton: true
          });
        });
        comment.loadedRepliesCount += response.replies.length;
        comment.hasMoreReplies = comment.loadedRepliesCount < comment.totalReplies;
        comment.isThreadOpen = true;
      });
  }

  toggleThread(comment: CommentNode) {
    comment.isThreadOpen = !comment.isThreadOpen;
    if (!comment.isThreadOpen) {
      comment.loadedRepliesCount = 0;
    }
    if (comment.isThreadOpen) {
      this.loadMoreReplies(comment);
    }
  }

  sanitizeHtml(html: string | undefined): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeUrl(url: string | undefined): SafeUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  handleReply(commentId: number | undefined): void {
    if (commentId) {
      this.replyTo.emit(commentId);
    }
  }

  isReplyActive(commentId: number | undefined): boolean {
    return commentId === this.replyingToId;
  }
}
