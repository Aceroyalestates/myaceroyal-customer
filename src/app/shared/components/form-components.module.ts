import { NgModule } from '@angular/core';
import { FormInputComponent } from './form-input/form-input.component';
import { FormSelectComponent } from './form-select/form-select.component';
import { FormButtonComponent } from './form-button/form-button.component';
import { PhoneInputComponent } from './phone-input/phone-input.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
  declarations: [],
  imports: [
    FormInputComponent,
    FormSelectComponent,
    FormButtonComponent,
    PhoneInputComponent,
    FileUploadComponent
  ],
  exports: [
    FormInputComponent,
    FormSelectComponent,
    FormButtonComponent,
    PhoneInputComponent,
    FileUploadComponent
  ]
})
export class FormComponentsModule { }
