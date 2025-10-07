import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				LoginComponent,
				ReactiveFormsModule,
				RouterTestingModule,
				InputComponent,
				ButtonComponent,
				LoaderComponent,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with empty form', () => {
		expect(component.loginForm.get('username')?.value).toBe('');
		expect(component.loginForm.get('password')?.value).toBe('');
	});

	it('should validate required fields', () => {
		const form = component.loginForm;
		expect(form.valid).toBeFalsy();
		
		form.controls['username'].setValue('testuser');
		form.controls['password'].setValue('testpass');
		
		expect(form.valid).toBeTruthy();
	});

	it('should toggle password visibility', () => {
		expect(component.showPassword).toBeFalsy();
		component.togglePasswordVisibility();
		expect(component.showPassword).toBeTruthy();
		component.togglePasswordVisibility();
		expect(component.showPassword).toBeFalsy();
	});
});

