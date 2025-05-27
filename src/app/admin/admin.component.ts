import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from "../app.component";
import { LayoutComponent } from "./_core/layout/layout.component";


@Component({
  selector: 'app-admin',
  imports: [RouterModule, AppComponent, LayoutComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
