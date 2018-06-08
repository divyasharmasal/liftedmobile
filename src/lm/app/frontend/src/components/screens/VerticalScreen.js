import { h, Component } from 'preact';
import { route } from "preact-router";
import Question from '../Question';
import { Screen } from './Screen';
import { clearSelectedItems } from "../../lib/store";

export { VerticalScreen };
             //{[>
            //← go back
            //*/}

class VerticalScreen extends Screen{
  render = () => {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          <a class="no_user_select top_nav_link home" 
             onClick={() => { route("/") }}>
            <img src="/static/app/dist/images/home.png" />
            Home
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
