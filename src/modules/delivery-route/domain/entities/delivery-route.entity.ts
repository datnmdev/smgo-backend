export type TDeliveryRouteStatus =
  'pending' | 'sorting' | 'delivering' | 'completed';

export interface TDeliveryRoute {
  id: string;
  name: string;
  status: TDeliveryRouteStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
