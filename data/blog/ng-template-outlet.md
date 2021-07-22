---
title: 'NgTemplateOutlet'
excerpt: 'Multi-slot content projection with angular''s NgTemplateOutlet'
coverImage: '/assets/blog/preview/cover.jpg'
date: '2021-05-04T05:35:07.322Z'
author:
  name: frive
ogImage:
  url: '/assets/blog/preview/cover.jpg'
---

I recently ran into a requirement to extract a component from an existing app to reuse for a new app. Quite simple, right? Not until the layout of the component's data needs to be customizable depending on the app where it is used.

Angular has a good documentation on [content projection](https://angular.io/guide/content-projection). Though it doesn't apply if the component needs to bind to some data – this is where [`NgTemplateOutlet`](https://angular.io/api/common/NgTemplateOutlet) comes in. ✨

### Component

```html:company-list.component.html
<mat-accordion displayMode="flat">
  <mat-expansion-panel *ngFor="let company of companyList">
    <mat-expansion-panel-header>
      <mat-panel-title>
        <ng-container *ngTemplateOutlet="companyHeaderTemplateRef; context: { $implicit: company }">
        </ng-container>
      </mat-panel-title>
    </mat-expansion-panel-header>
    <ng-container *ngTemplateOutlet="companyDetailTemplateRef; context: { $implicit: company }">
    </ng-container>
  </mat-expansion-panel>
</mat-accordion>
```

`NgTemplateOutlet` takes a `TemplateRef` and an `Object` for context. The `$implicit` key in the context sets its default value.

Using the `NgTemplateOutlet` directive for the header and detail allows us to project contents to these parts.

```ts:company-list.component.ts
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'company-list',
  templateUrl: 'company-list.component.html',
  styleUrls: ['company-list.component.css']
})
export class CompanyListComponent {
  @ContentChild('companyHeader', { static: false })
  companyHeaderTemplateRef: TemplateRef<any>;

  @ContentChild('companyDetail', { static: false })
  companyDetailTemplateRef: TemplateRef<any>;

  @Input() companyList: Company[];

  constructor() {}
}

```

[`ContentChild`](https://angular.io/api/core/ContentChild) queries the component's content matching the template reference variable as the selector and returns a `TemplateRef`.

### Usage

```html:app.component.hmtl
<company-list [companyList]="companyList">
  <ng-template let-company #companyHeader>
    <p>{{ company.name }}</p>
  </ng-template>
  <ng-template let-company #companyDetail>
    <p>{{ company.description }}</p>
    <span>{{ company.phone }}</span>
  </ng-template>
</company-list>
```
<br>

```html:new-app.component.html
<company-list [companyList]="companyList">
  <ng-template let-company #companyHeader>
    <strong>{{ company.name }}</strong>
  </ng-template>
  <ng-template let-company #companyDetail>
    <span>Please call {{ company.phone }} for more info</span>
  </ng-template>
</company-list>
```

All we need to do now is to mark `ng-template` with the template variable strings we declared in the `ContentChild`, and all the template's content will be projected to the component – while the component's data can be accessed via `let` declarations. 

---
Here's the full sample in stackblitz.
<iframe class="stackblitz-embed" src="https://stackblitz.com/edit/ngtemplateoutlet-ngfor?embed=1&file=src/app/company-list/company-list.component.html"></iframe>
<br>