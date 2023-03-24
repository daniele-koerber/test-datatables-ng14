import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfigService } from '../../../@core/utils/services/config.service';
import { ParametersData } from '../../../@core/data/parameters';
import { ConfigurationData } from '../../../@core/data/configuration';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-product-details',
  styleUrls: ['./product-details.component.scss'],
  templateUrl: './product-details.component.html',
})

export class ProductDetailsSmallComponent implements OnInit {

  selectedProcessCell: any;
  @Input() id: any;
  definition: any;
  @Input() title;
  @Input() readonly;
  @Input() definitions;
  processCellsArray: any = [];
  pcSub: Subscription;
  loadSub: Subscription;

  buttonDisabled: boolean = true;

  helpLinkPage = 'product-definition-small';
  helpPageLinkDestination = '#';

  constructor(
    private config: ConfigService,
    protected ref: NbDialogRef<ProductDetailsSmallComponent>,
    private configurationService: ConfigurationData,
    private parametersService: ParametersData,
  ) { }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    this.setHelpPage();
  }

  updateTargetProcessCellData() {
    this.processCellsArray = this.configurationService.getProcessCellsArray();
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.updateTable();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  updateTable() {
    if (this.id) {
      this.helpLinkPage = 'product-definition-duplicate';
      this.parametersService.getProductDefinitionById(this.id).then(definition => {
        this.definition = definition;
      });
    } else {
      this.helpLinkPage = 'product-definition-addnew';
      this.definition = {
        productCode: '',
        productDescription: '',
        version: 0,
      };
    }

  }

  checkProcessCell(selectedProcessCell, processCellsArray) {
    if (processCellsArray) {
      const pc = processCellsArray.find(el => el.processCellPath === selectedProcessCell.path)
      return pc;
    } else return { isActive: false };
  }

  emitChange(event) {
    this.definition[event.target.id] = event.target.value;
  }

  setButtonState(value) {
    this.buttonDisabled = value;
  }

  onFormSubmit() {
    this.ref.close(this.definition);
  }

  cancel() {
    this.ref.close();
  }
  closeModal() {
    this.ref.close(true);
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
   }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
