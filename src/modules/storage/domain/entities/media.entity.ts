export interface TMedia {
  id: string;
  fileKey: string;
  status: 'pending' | 'attached';
  createdAt: Date;
}
