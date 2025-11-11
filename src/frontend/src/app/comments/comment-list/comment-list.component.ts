import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommentViewModel } from '../../comment.model';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser'; 
import { CommonModule, DatePipe } from '@angular/common'; 

interface CommentNode extends CommentViewModel {
    replies?: CommentNode[];
}

@Component({
    selector: 'app-comment-list',
    standalone: true, 
    imports: [CommonModule, DatePipe], 
    templateUrl: './comment-list.component.html',
    styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnChanges {

    @Input() allComments: CommentViewModel[] = [];
    @Input() replyingToId: number | null = 0;

    @Output() replyTo = new EventEmitter<number>();

    public hierarchicalComments: CommentNode[] = [];

    constructor(private sanitizer: DomSanitizer) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['allComments'] && this.allComments) {
            // Clone and sort the array by date (Newest comments first)
            const sortedComments = [...this.allComments].sort((a, b) => {
                return new Date(b.date!).getTime() - new Date(a.date!).getTime();
            });
            this.hierarchicalComments = this.buildHierarchy(sortedComments);
        }
    }

    private buildHierarchy(comments: CommentViewModel[]): CommentNode[] {
        const commentMap = new Map<number, CommentNode>();
        const rootComments: CommentNode[] = [];
        comments.forEach(comment => {
            if (comment.id) {
                commentMap.set(comment.id, { ...comment, replies: [] });
            }
        });
        commentMap.forEach(commentNode => {
            const parentId = commentNode.parentCommentId;

            if (parentId && parentId !== 0) {
                const parent = commentMap.get(parentId);
                if (parent) {
                    parent.replies!.unshift(commentNode); 
                } else {
                    rootComments.push(commentNode);
                }
            } else {
                rootComments.push(commentNode);
            }
        });

        return rootComments;
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