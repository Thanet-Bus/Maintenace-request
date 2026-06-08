export interface RepairRequest {
  id: number;
  requester_id: number;
  title: string;
  description: string;
  location: string;
  status: string;
  appointment_date: string | null;
  created_at: string;
  updated_at: string;
  technicians?: TechnicianDetail[];
  images?: RepairImage[];
}

export interface RepairLog {
  id: number;
  repair_request_id: number;
  changed_by: number;
  status_to: string;
  note: string | null;
  created_at: string;
}

export interface Technician {
  id: number;
  username: string;
  full_name: string | null;
  role: string;
}

export interface AssignmentDetail {
  // id: number;
  technician_id: number;
  is_leader: boolean;
  assigned_at: string;
  technician_name?: string;
}

export interface AssignmentResponse {
  repair_request_id: number;
  status: string;
  technicians: AssignmentDetail[];
}

export interface RepairImage {
  id: number;
  repair_request_id: number;
  uploaded_by: number | null;
  image_url: string;
  image_type: string;
  created_at: string;
}

export interface Review {
  id: number;
  repair_request_id: number;
  technician_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type TechnicianDetail = {
  id: number;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
  is_leader: boolean;
};

export interface User {
  id: number;
  line_user_id: string | null;
  emp_id: string | null;
  name: string | null;
  profile_image_url: string | null;
  role: string;
}
