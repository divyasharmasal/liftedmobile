import { h, Component } from "preact";
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import "react-simple-dropdown/styles/Dropdown.css";
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css';

import CloseButton from "./CloseButton";


export class CourseDateFilter extends Component{
  closeDropdown = () => {
    this.dropdown.hide();
  }


  handleDateRangeChange = dates => {
    if (dates.length == 2){
      const startDate = dates[0];
      const endDate = dates[1];
      this.setState({
        dateRange: { startDate, endDate },
      });
    }
    else{
      this.setState({
        dateRange: null,
      });
    }
  }


  selectFilterBtn = () => {
    if (this.state.dateRange){
      this.props.onDateRangeSelect(this.state.dateRange);
    }
    else{
      this.props.onDateRangeClear();
    }
    this.dropdown.hide();
  }


  clearDates = () => {
    this.picker.flatpickr.clear();
  }


  render(){
    return(
      <div>
        <Dropdown ref={dropdown => {this.dropdown = dropdown; }}>
          <DropdownTrigger>
            <span class="label">Date range</span>
            <img class="expand" src="/static/app/dist/images/courses/sort_show.png" />
          </DropdownTrigger>
          <DropdownContent>
            <div 
              onClick={this.closeDropdown}
              class="overlay"
            >
            </div>

            <div class="filter">
              <CloseButton onClick={this.closeDropdown} />
              <div class="date_picker">
                <div class="instructions">
                  <span>Please select a date range:</span>
                </div>
                <Flatpickr 
                  ref={picker => this.picker = picker}
                  onChange={this.handleDateRangeChange}
                  options={{
                    inline: true,
                    mode: "range",
                    altInput: true,
                  }} />
              </div>

              <div class="buttons">

                <div class="button cancel"
                  onClick={this.closeDropdown}
                >
                  <a>Cancel</a>
                </div>
                {this.state.dateRange != null &&

                <div class="button cancel"
                  onClick={this.clearDates}
                >
                  <a>Clear</a>
                </div>
                }

                <div class="button ok"
                  onClick={this.selectFilterBtn}
                >
                  <a>Filter</a>
                </div>

              </div>

            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
}
