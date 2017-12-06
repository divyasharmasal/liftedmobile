import { h, Component } from "preact";
import ListInput from "./ListInput";

export class LiftedKeyInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      values: this.props.values,
      invalid: false,
    };
  }


  componentWillReceiveProps = newProps => {
    if (this.state.values !== newProps.values ||
        this.state.invalid !== newProps.invalid){
      this.setState({
        values: newProps.values,
        invalid: newProps.invalid,
      });
    }
  }


  handleRemoveItem = index => {
    let values = this.state.values;
    values.splice(index, 1);
    this.handleValueChange(values)
  }


  handleVerticalSelect = (e, index) => {
    const vertical_name = e.target.value;
    let values = this.state.values;
    values[index].vertical_name = vertical_name;

    this.handleValueChange(values)
  }


  handleVerticalCategorySelect = (e, index) => {
    const vertical_category_name = e.target.value;
    let values = this.state.values;
    values[index].vertical_category_name = vertical_category_name;
    this.handleValueChange(values)
  }


  handleValueChange = values => {
    this.setState({ values }, () => {
      this.props.handleValueChange(values);
    });
  }


  newItem = () => {
    return {
      vertical_name: null,
      vertical_category_name: null,
    };
  }


  renderItem = (item, index) => {
    const sortedVerticalNames = Object.keys(this.props.verticals).sort();
    let selectedVerticalIndex;
    if (item.vertical_name){
      selectedVerticalIndex = sortedVerticalNames.indexOf(item.vertical_name) + 1;
    }


    let selectedVerticalCategoryIndex;
    if (item.vertical_category_name){
      selectedVerticalCategoryIndex =
        this.props.verticals[item.vertical_name].indexOf(item.vertical_category_name) + 1;
    }


    return (
      <div class="custom_input liftedkey_input_item">
        <select 
          selectedIndex={selectedVerticalIndex}
          onChange={e => this.handleVerticalSelect(e, index)}>
          <option value="" disabled selected>Select a vertical:</option>
          {
            //Object.keys(this.props.verticals).map(vertical =>
            sortedVerticalNames.map(vertical =>
              <option>
                {vertical}
              </option>
            )
          }
        </select>

        {this.state.values[index] &&
         this.state.values[index].vertical_name != null &&
          <select 
            selectedIndex={selectedVerticalCategoryIndex}
            onChange={e => this.handleVerticalCategorySelect(e, index)}>
            <option value="" disabled selected>Select a category:</option>
            {
              this.props.verticals[this.state.values[index].vertical_name].map(
                vertical_category =>
                  <option>
                    {vertical_category}
                  </option>
                )
            }
          </select>
        }
        <span 
          title="Remove key" 
          class="remove_btn no_user_select" 
          onClick={() => this.handleRemoveItem(index)}
        >
          ✕
        </span>
      </div>
    );
  }


  render(){
    const renderClassname = (isInvalid, className) => {
      return (isInvalid ? "highlight" : "") + " " + className;
    }

    return(
      <div class={renderClassname(this.state.invalid, "lifted_key_input")}>
        <label>LIFTED Keys:</label>
        <ListInput
          handleValueChange={this.handleValueChange}
          addItemTitle="Add key"
          newItem={this.newItem}
          removeItemTitle="Remove key"
          items={this.state.values}
          renderItem={this.renderItem}
        />

      </div>
    );
  }
}
