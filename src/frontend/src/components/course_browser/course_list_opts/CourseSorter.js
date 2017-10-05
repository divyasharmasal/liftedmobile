import { h, Component } from "preact";
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import "react-simple-dropdown/styles/Dropdown.css";

import CloseButton from "./CloseButton";


const ASC = "asc";
const DESC = "desc";
class Sorter extends Component{
  selectSortOpt = () => {
    let direction;
    if (this.state.direction == null){
      direction = DESC;
    }
    else if (this.state.direction === ASC){
      direction = DESC;
    }
    else if (this.state.direction === DESC){
      direction = ASC;
    }

    this.setState({ direction }, () => {
      this.props.selectSortOpt(this.props.label, direction);
    });
  }


  renderDirectionLabel = () => {
    if (this.state.direction == null){
      return null;
    }
    else if (this.state.direction === ASC){
      return <span class="direction">{this.props.ascLabel}</span>
    }
    else if (this.state.direction === DESC){
      return <span class="direction">{this.props.descLabel}</span>
    }
  }


  render(){
    let className;
    let directionLabel;
    if (this.props.label === this.props.parentSelectedField){
      className = this.state.direction == null ? "" : "selected";
      directionLabel = this.renderDirectionLabel();
    }

    return(
      <div 
        onClick={this.selectSortOpt} class={className}
      >

        <span class="label">{this.props.label}</span>

        {directionLabel}

      </div>
    );
  }
}


export class CourseSorter extends Component{
  closeDropdown = () => {
    this.dropdown.hide();
    this.setState({
      sortBy: null,
    });
  }


  selectSortOpt = (field, direction) => {
    this.dispatch({
      type: "SELECT_SORT_OPT",
      data: { field, direction }
    });
  }


  selectSortBtn = () => {
    if (this.state.sortBy){
      this.props.onSort(this.state.sortBy);
    }
    this.dropdown.hide();
  }


  reduce = (prevState, action) => {
    switch (action.type){
      case "SELECT_SORT_OPT":
        return { sortBy: action.data };
    default:
        return prevState;
    }
  }


  dispatch = (action, callback) => {
    this.setState(prevState => this.reduce(prevState, action), () => {
      if (callback){
        callback();
      }
    });
  }


  render(){
    const parentSelectedField = this.state.sortBy != null? this.state.sortBy.field : null;

    return(
      <div>
        <Dropdown ref={dropdown => {this.dropdown = dropdown; }}>
          <DropdownTrigger>
            <span class="label">Sort results</span>
            <img class="expand" src="/static/app/dist/images/courses/sort_show.png" />
          </DropdownTrigger>
          <DropdownContent>
            <div 
              onClick={this.closeDropdown}
              class="overlay">
            </div>
            <div class="sorter">
              <CloseButton onClick={this.closeDropdown} />

              <div class="row">
                <div class="instructions">
                  {this.state.sortBy ?
                      <span>Select it again to change the sort order, then click Sort.</span>
                      :
                      <span>Select a field to sort by, then click Sort.</span>
                  }
                </div>
              </div>

              <div class="row">
                <Sorter
                  label="CPD points"
                  parentSelectedField={parentSelectedField}
                  selectSortOpt={this.selectSortOpt}
                  descLabel="most first"
                  ascLabel="least first"
                />
              </div>

              <div class="row">
                <Sorter
                  label="Date"
                  parentSelectedField={parentSelectedField}
                  selectSortOpt={this.selectSortOpt}
                  descLabel="furthest first"
                  ascLabel="closest first"
                />
              </div>

              <div class="row">
                <Sorter
                  label="Cost"
                  parentSelectedField={parentSelectedField}
                  selectSortOpt={this.selectSortOpt}
                  descLabel="most expensive first"
                  ascLabel="cheapest first"
                />
              </div>

              <div class="row">
              </div>

              <div class="buttons">

                <div class="button cancel"
                  onClick={this.closeDropdown}
                >
                  <a>Cancel</a>
                </div>

                {this.state.sortBy &&
                  <div class="button ok"
                    onClick={this.selectSortBtn}
                  >
                    <a>Sort</a>
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

