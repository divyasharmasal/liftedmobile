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
    const startDate = dates[0];
    const endDate = dates[1];
    console.log(startDate);
    console.log(endDate);
    this.setState({
      dateRange: { startDate, endDate },
    });
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
                  <p>Please select a date range:</p>
                </div>
                <Flatpickr 
                  onChange={this.handleDateRangeChange}
                  options={{
                    inline: true,
                    mode: "range",
                    altInput: true,
                    defaultDate: ["2017/10/05", "2017/10/10"],
                  }} />
              </div>

              <div class="buttons">

                <div class="button cancel"
                  onClick={this.closeDropdown}
                >
                  <a>Cancel</a>
                </div>

                {this.state.dateRange &&
                    <div class="button ok"
                      onClick={this.selectSortBtn}
                    >
                  <a>Filter</a>
                </div>
                }

              </div>

            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    );
  }
}
