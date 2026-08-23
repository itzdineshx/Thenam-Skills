export interface IActivity {
  id?: string;
  user: string; // references user.firebaseUid
  type: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  createdAt?: any;
  likedBy?: string[];
  comments?: any[];
}

export type Activity = IActivity;
