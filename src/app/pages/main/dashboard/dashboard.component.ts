import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Metrics } from '../../../core/constants';
import { Metric } from '../../../core/types/general';
import { Activity } from '../../../core/models/generic';
import { Property } from '../../../core/models/properties';
import { SharedModule } from '../../../shared/shared.module';
import { TableColumn, TableAction } from '../../../shared/components/table/table.component';
import { DashboardService } from '../../../core/services/dashboard.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NzSelectModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  activities!: Activity[];
  lucy!: string;
  columns: TableColumn[] = [
    {
      key: 'full_name',
      title: 'Name',
      sortable: true,
      type: 'text',
    },
    {
      key: 'action',
      title: 'Activity',
      sortable: false,
      type: 'text',
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      type: 'text',
    },
    // {
    //   key: 'is_active',
    //   title: 'Status',
    //   sortable: true,
    //   type: 'status',
    // },
  ];
  actions: TableAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: 'eye',
      color: 'red',
      tooltip: 'View details',
    },
  ];

  metrics: Metric[] = Metrics;
  properties!: Property[];
  isVisible = false;
  activity: Activity = {} as Activity;

  // Report Filters
  systemReportFilters = {
    startDate: '',
    endDate: '',
    userRole: ''
  };

  customerReportFilters = {
    startDate: '',
    endDate: '',
    activityType: ''
  };

  // Report Data
  systemActivities: any[] = [];
  customerActivities: any[] = [];
  systemReportLoading = false;
  customerReportLoading = false;

  // System Report Columns
  systemReportColumns: TableColumn[] = [
    {
      key: 'user_name',
      title: 'User',
      sortable: true,
      type: 'text',
    },
    {
      key: 'user_role',
      title: 'Role',
      sortable: true,
      type: 'text',
    },
    {
      key: 'action',
      title: 'Activity',
      sortable: false,
      type: 'text',
    },
    {
      key: 'details',
      title: 'Details',
      sortable: false,
      type: 'text',
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      type: 'text',
    },
  ];

  systemReportActions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: 'eye',
      color: 'blue',
      tooltip: 'View activity details',
    },
  ];

  // Customer Report Columns
  customerReportColumns: TableColumn[] = [
    {
      key: 'customer_name',
      title: 'Customer',
      sortable: true,
      type: 'text',
    },
    {
      key: 'activity_type',
      title: 'Activity Type',
      sortable: true,
      type: 'text',
    },
    {
      key: 'description',
      title: 'Description',
      sortable: false,
      type: 'text',
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      type: 'text',
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      type: 'status',
    },
  ];

  customerReportActions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: 'eye',
      color: 'blue',
      tooltip: 'View customer activity details',
    },
  ];
  
  // Property analytics data
  get propertyAnalytics() {
    const availableProperties = this.metrics.find(m => m.title === 'Available Properties')?.amount as number || 72;
    const totalProperties = this.metrics.find(m => m.title === 'Total Properties')?.amount as number || 120;
    const pendingProperties = Math.floor(totalProperties * 0.23); // 23% pending
    const soldProperties = totalProperties - availableProperties - pendingProperties;
    
    return {
      available: availableProperties,
      pending: pendingProperties,
      sold: soldProperties
    };
  }

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard initialized');
    this.getDashboard();
    this.loadUsers();
    this.initializeReportDates();
    this.loadSystemReport();
    this.loadCustomerReport();
  }
// https://myaceroyal-backend.onrender.com/api/dashboard

  private initializeReportDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    this.systemReportFilters.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.systemReportFilters.endDate = today.toISOString().split('T')[0];
    
    this.customerReportFilters.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.customerReportFilters.endDate = today.toISOString().split('T')[0];
  }

  loadSystemReport(): void {
    this.systemReportLoading = true;
    
    // Mock data for system activities
    setTimeout(() => {
      this.systemActivities = [
        {
          id: 1,
          user_name: 'John Admin',
          user_role: 'Admin',
          action: 'Property Created',
          details: 'Created new property: Lagos Luxury Apartment',
          date: '2024-12-09 10:30 AM',
          status: 'Completed'
        },
        {
          id: 2,
          user_name: 'Sarah Realtor',
          user_role: 'Realtor',
          action: 'Client Meeting',
          details: 'Met with potential buyer for Property #123',
          date: '2024-12-09 02:15 PM',
          status: 'Completed'
        },
        {
          id: 3,
          user_name: 'Mike User',
          user_role: 'User',
          action: 'Profile Updated',
          details: 'Updated contact information and preferences',
          date: '2024-12-09 04:45 PM',
          status: 'Completed'
        },
        {
          id: 4,
          user_name: 'Admin System',
          user_role: 'Admin',
          action: 'Report Generated',
          details: 'Generated monthly revenue report',
          date: '2024-12-09 06:00 PM',
          status: 'Completed'
        },
        {
          id: 5,
          user_name: 'Jane Realtor',
          user_role: 'Realtor',
          action: 'Property Updated',
          details: 'Updated pricing for Property #456',
          date: '2024-12-09 08:20 PM',
          status: 'Completed'
        }
      ];
      this.systemReportLoading = false;
    }, 1000);
  }

  loadCustomerReport(): void {
    this.customerReportLoading = true;
    
    // Mock data for customer activities
    setTimeout(() => {
      this.customerActivities = [
        {
          id: 1,
          customer_name: 'Alice Johnson',
          activity_type: 'Account Created',
          description: 'New customer registration completed',
          date: '2024-12-09 09:15 AM',
          status: 'Active'
        },
        {
          id: 2,
          customer_name: 'Bob Williams',
          activity_type: 'Subscription Form',
          description: 'Filled premium subscription form',
          date: '2024-12-09 11:30 AM',
          status: 'Pending'
        },
        {
          id: 3,
          customer_name: 'Carol Davis',
          activity_type: 'Payment Made',
          description: 'Payment of ₦50,000 for property consultation',
          date: '2024-12-09 01:45 PM',
          status: 'Completed'
        },
        {
          id: 4,
          customer_name: 'David Brown',
          activity_type: 'Property Viewed',
          description: 'Viewed Lagos Luxury Apartment details',
          date: '2024-12-09 03:20 PM',
          status: 'Active'
        },
        {
          id: 5,
          customer_name: 'Emma Wilson',
          activity_type: 'Inquiry Sent',
          description: 'Sent inquiry about Abuja property pricing',
          date: '2024-12-09 05:30 PM',
          status: 'Pending'
        },
        {
          id: 6,
          customer_name: 'Frank Miller',
          activity_type: 'Payment Made',
          description: 'Payment of ₦2,500,000 for property purchase',
          date: '2024-12-09 07:10 PM',
          status: 'Completed'
        }
      ];
      this.customerReportLoading = false;
    }, 1000);
  }

  onSystemReportAction(event: { action: string; row: any }): void {
    console.log('System report action:', event.action, 'Row:', event.row);
    switch (event.action) {
      case 'view':
        this.viewSystemActivity(event.row);
        break;
    }
  }

  onSystemReportRowClick(row: any): void {
    console.log('System report row clicked:', row);
    this.viewSystemActivity(row);
  }

  onCustomerReportAction(event: { action: string; row: any }): void {
    console.log('Customer report action:', event.action, 'Row:', event.row);
    switch (event.action) {
      case 'view':
        this.viewCustomerActivity(event.row);
        break;
    }
  }

  onCustomerReportRowClick(row: any): void {
    console.log('Customer report row clicked:', row);
    this.viewCustomerActivity(row);
  }

  private viewSystemActivity(activity: any): void {
    // Handle viewing system activity details
    console.log('Viewing system activity:', activity);
    // You can open a modal or navigate to details page
  }

  private viewCustomerActivity(activity: any): void {
    // Handle viewing customer activity details
    console.log('Viewing customer activity:', activity);
    // You can open a modal or navigate to details page
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadUsers() {
    console.log('Loading users...');
    this.loading = true;
      this.dashboardService.getActivityLogs(1, PAGE_SIZE, {}).subscribe({
      next: (response1) => {
        console.log('Activity log response:', response1);
        this.activities = response1.data?.map((activity) => ({
          ...activity,
          full_name: activity.user.full_name,
          date: new Date(activity.createdAt).toLocaleDateString(),
          // is_active: user.is_active === true ? 'Active' : 'Inactive',
        })) || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load users';
      },
    });
  }

  getTransparentColor(hex: string): string {
    // Convert HEX to rgba
    if (!hex.startsWith('#')) return hex;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  onTableAction(event: { action: string; row: Activity }) {
    console.log('Table action:', event.action, 'Row:', event.row);
    switch (event.action) {
      case 'view':
        this.viewUser(event.row);
        break;
    }
  }

  onRowClick(row: Activity) {
    // Navigate to user details
    window.location.href = `/main/user-management/view/${row.id}/${row.user.full_name}`;
  }

  viewUser(activity: Activity) {
    console.log('Viewing activity:', activity);
    this.isVisible = true;
    this.activity = activity;
    console.log('This is the id', this.activity);
  }

  handleAccountDetailsClose() {
    this.isVisible = false;
  }

  getDashboard() {
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        console.log('Dashboard data:', response);
        // Update metrics or other dashboard data as needed
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
      }
    });
  }
}
