import { h, Component } from "preact";

export default class ListInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      items: this.props.items,
    };
  }


  componentWillReceiveProps(newProps){
    if (this.state.items !== newProps.items){
      this.state = {
        items: newProps.values,
      }
    }
  }


  addItem = e => {
    let items;
    if (!this.state.items){
      items = [];
    }
    else{
      items = this.state.items;
    }

    items = items.concat(this.props.newItem());
    this.setState({ 
      items
    }, () => {
      this.props.handleValueChange(items);
    });
  }


  //removeItem = index => {
    //let items = this.state.items;
    //items.splice(index, 1);
    //this.setState({ items }, () => {
      //this.props.handleValueChange(items);
    //});
  //}


  updateItem = (index, value) => {
    let items = this.state.items;
    items[index] = value;
    this.setState({ items }, () => {
      this.props.handleValueChange(items);
    });
  }


  render() {
    return (
      <div class="list_input">
        <div class="button_col">
          {!this.props.disabled &&
              <button 
                disabled={this.props.disabled}
                title={this.props.addItemTitle}
                onClick={this.addItem}
                class="add_button pure-button pure-button-primary">
                +
              </button>
          }
        </div>
        <div class="list_input_col">
          {(!this.state.items || this.state.items.length === 0) ?
            <p class="empty">(no entries)</p>
        :
          this.state.items.map(this.props.renderItem)
          }
        </div>
      </div>
    );
  }
}


class ListInputItem extends Component{
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
    };
  }


  componentWillReceiveProps = newProps => {
    if (newProps.value !== this.state.value){
      this.setState({
        value: newProps.value,
      });
    }
  }


  handleValueChange = value => {
    this.setState({ value }, () => {
      this.props.handleValueChange(value);
    });
  }


  render(){
    return(
      <div class="list_input_item">
        <input
          disabled={this.props.disabled}
          onKeyUp={e => this.handleValueChange(e.target.value)}
          onChange={e => this.handleValueChange(e.target.value)}
          type="text" 
          maxlength="10" placeholder={this.props.placeholder} 
          value={this.state.value} />
        {!this.props.disabled &&
          <span
            onClick={this.props.handleRemoveItem}
            title={this.props.removeItemTitle} class="remove_btn">✕</span>
        }
      </div>
    );
  }
}
