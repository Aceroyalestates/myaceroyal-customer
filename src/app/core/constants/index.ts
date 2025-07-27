import { Person, Metric, Property, PaymentSchedule, InspectionSchedule } from '../types/general';

export const People: Person[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 29 },
];
export const Metrics: Metric[] = [
  {
    id: 1,
    amount: 120,
    title: 'Total Properties',
    percentage: '14',
    color: '#34A853',
  },
  {
    id: 2,
    amount: 24,
    title: 'Total Client',
    percentage: '14',
    color: '#FBBC05',
  },
  {
    id: 3,
    amount: 72,
    title: 'Available Properties',
    percentage: '14',
    color: '#E41C24',
  },
  {
    id: 4,
    amount: 51,
    title: 'Total Realtors',
    percentage: '14',
    color: '#4D76B8',
  },
];

export const Properties: Property[] = [
  {
    id: 1,
    image: 'images/property-image.jpg',
    name: 'Eko Parapo Residence',
    price: '200,000,000',
    location: 'Lagos-Epe Expressway, Abijo, Lagos',
    quantity: '3 Plots Available',
    amenities: 'Electricity, Pipe-borne Water, Tarred Road',
    propertyType: 'Land',
    unitType: 'Plot'
  },
  {
    id: 2,
    image: 'images/property-image.jpg',
    name: 'Eko Parapo Residence',
    price: '200,000,000',
    location: 'Lagos-Epe Expressway, Abijo, Lagos',
    quantity: '3 Plots Available',
    amenities: 'Electricity, Pipe-borne Water, Tarred Road',
    propertyType: 'Land',
    unitType: 'Acres'
  },
];


export const PaymentSchedules: PaymentSchedule[] = [
  {
    currInstallment: '1',
    amount: '300,000,000',
    date: '20-06-2025',
    noOfInstallment: '3',
    status: 'paid',
  },
  {
    currInstallment: '2',
    amount: '300,000,000',
    date: '20-06-2025',
    noOfInstallment: '3',
    status: 'pending',
  },
  {
    currInstallment: '3',
    amount: '300,000,000',
    date: '20-06-2025',
    noOfInstallment: '3',
    status: 'overdue',
  },
];

export const INSPECTION_SCHEDULES: InspectionSchedule[] = [
  {
    id: 1,
    property: 'Eko Parapo Residence',
    date: '2023-10-01',
    realtor: 'John Doe',
    status: 'upcoming',
  },
  {
    id: 2,
    property: 'Eko Parapo Residence',
    date: '2023-10-05',
    realtor: 'Jane Smith',
    status: 'completed',
  },
  {
    id: 3,
    property: 'Eko Parapo Residence',
    date: '2023-10-10',
    realtor: 'Alice Johnson',
    status: 'cancelled',
  },
  {
    id: 4,
    property: 'Eko Parapo Residence',
    date: '2023-10-15',
    realtor: 'Bob Brown',
    status: 'upcoming',
  },
  {
    id: 5,
    property: 'Eko Parapo Residence',
    date: '2023-10-20',
    realtor: 'Charlie Davis',
    status: 'completed',
  },
  {
    id: 6,
    property: 'Eko Parapo Residence',
    date: '2023-10-25',
    realtor: 'Diana Wilson',
    status: 'cancelled',
  },
  {
    id: 7,
    property: 'Eko Parapo Residence',
    date: '2023-10-30',
    realtor: 'Ethan Martinez',
    status: 'upcoming',
  },
]
