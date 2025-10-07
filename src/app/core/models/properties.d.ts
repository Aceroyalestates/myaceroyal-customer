import { IResponse, Pagination } from './generic';

export interface PropertyResponse extends IResponse {
  data: Property[];
  pagination: Pagination;
}

export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  type_id: number;
  location: string;
  address: string;
  listed_by: string;
  is_available: boolean;
  vr_link: string;
  deleted_at: string | null;
  createdAt: string;
  updatedAt: string;
  property_type: PropertyType;
  property_images: PropertyImage[];
  property_units: PropertyUnit[];
  property_features: PropertyFeature[];
}

export interface PropertyImage {
  id: number;
  image_url: string;
  is_cover: boolean | null;
}

export interface PropertyUnit {
  id: number;
  name: number | null;
  price: string;
  is_available: boolean;
  unit_type: UnitType;
  property_installment_plans: PropertyInstallmentPlan[];
}

export interface PropertyInstallmentPlan {
  id: number;
  plan_id: number;
  initial_amount: string;
  total_price: string;
  start_date: string;
  is_active: boolean;
  property_plan: PropertyPlan;
}

export interface PropertyPlan {
  title: string;
}

export interface PropertyFeature {
  feature_id: number;
  feature: {
    name: string;
  };
}

export interface PropertyUpdateResponse {
  message: string;
  property: Property;
}

export interface PropertyTypeOptions {
  value: number;
  label: string;
  name: string;
}

export interface PropertyType {
    id: number;
    name: string;
    label: string | null;
    deleted_at: string | null;
    createdAt: string;
    updatedAt: string;
    properties: Partial<Property>[];
}

export interface PropertyFeatureAdmin {
  id: number;
  name: string;
  icon: string;
}

export interface UnitType {
  id: number;
  name: string;
  type_id: string;
  label: string | null;
  default_size: string | null;
}

export interface PropertyCreateRequest {
    name: string;
    description: string;
    type_id: number;
    location: string;
    address?: string;
    vr_link?: string;
    property_images?: PropertyImage[];
    features: number[];
    property_units?: PropertyUnitCreate[];
    payment_plans?: InstallmentPlanCreate[];
}
export interface PropertyUnitRequest {
  unit_types: PropertyUnitCreate[];
}

interface PropertyUnitCreate {
    unit_type_id: number;
    price: string;
    total_units: number;
}

export interface InstallmentPlanCreate {
    unit_id: string;
    plan_id: string;
    initial_amount: string;
    total_price: string;
    start_date: string;
}

export interface FeatureRequest {
    features: number[];
}
export interface InstallmentPlan {
    id: string;
    title: string;
    installments_count: number;
    duration_months: number;
    is_active: boolean;
}

export interface InstallmentPlanRequest {
  installment_plans: Array<{
    plan_id: string;
    unit_id: number;
    initial_amount: number;
    total_price: number;
    start_date: string;
  }>;
}

export interface TogglePropertyAvailabilityResponse {
  message: string;
  is_available: boolean;
}

// Appointment-related interfaces
export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  property_id: string;
  appointment_type: 'inspection' | 'viewing' | 'consultation';
  appointment_date: string;
  appointment_time: string;
  time_period: 'AM' | 'PM';
  special_requirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface AppointmentCreateRequest {
  full_name: string;
  email: string;
  phone_number: string;
  property_id: string;
  appointment_type: string;
  appointment_date: string;
  special_requirements?: string;
}

export interface AppointmentResponse extends IResponse {
  data: Appointment;
}

export interface AppointmentsResponse extends IResponse {
  data: Appointment[];
  pagination?: Pagination;
}

export interface AvailableSlot {
  property_id: string;
  date: string;
  available_slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  period: 'AM' | 'PM';
  display: string;
}

export interface AvailableSlotsResponse extends IResponse {
  data: AvailableSlot;
}

export interface AppointmentSearchParams {
  q?: string; // General search query (full name, confirmation code, property name)
  email?: string; // Exact email address
  phone?: string; // Phone number (partial matches supported)
  page?: number;
  limit?: number;
}