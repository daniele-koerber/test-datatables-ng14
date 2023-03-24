//Import the Component
import { NGKDSButtonComponent } from './button/button.component';
import { NGKDSTabComponent } from './tab/tab.component';

//Add the imports to the named exported object
export const components: any[] = [
  NGKDSButtonComponent,
  NGKDSTabComponent,
]


//Export the Component

export * from './button/button.component';
export * from './tab/tab.component';

export { TabItemDirective } from './tab/directives/tab-item.directive';
export { TabsItemsDirective } from './tab/directives/tab-items.directive';
