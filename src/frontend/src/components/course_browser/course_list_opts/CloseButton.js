import { h, Component } from "preact";

export default class CloseButton extends Component{
  render(){
    return(
      <div class="close_btn">
        <img 
          onClick={this.props.onClick}
          src="/static/app/dist/images/courses/cross.png" />
      </div>
    );
  }
}
