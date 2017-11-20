import { h, Component } from 'preact';
import { route } from 'preact-router';
import { TechScreen } from "./TechScreen";
import Question from '../Question';

export class TechRoleScreen extends TechScreen{
  handleOptionSelect = answer => {
    const role = this.props.qnData.options[answer];
    this.props.handleOptionSelect(this.props.name, role, 
                                  this.routeToNextScreen);
  }

  render(){
    return(
      <div className="pure-g">
        <div className="pure-u-1">
          <a class="no_user_select top_nav_link start_over" 
             onClick={() => { route("/") }}>
            ← go back
          </a>

					<Question
            screenName={this.props.name}
						isMultiQn={false}
						handleOptionSelect={this.handleOptionSelect}
						qnData={this.props.qnData} 
					/>

        </div>
      </div>
    );
  }
}
