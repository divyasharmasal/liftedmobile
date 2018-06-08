import { h, Component } from 'preact';
import Question from '../../Question';
import { route } from 'preact-router';
import { Screen, } from '../Screen';

export {GoalScreen};

class GoalScreen extends Screen{
  handleOptionSelect = id => {
    this.props.handleOptionSelect(this.props.name, id);
    route(this.props.nextScreenPaths[id]);
  }


  render(){
    return (
      <div className="pure-g">
        <div className="pure-u-1-3">
          <a class="no_user_select top_nav_link home" 
             onClick={() => { route("/") }}>
            <img src="/static/app/dist/images/home.png" />
            Home
          </a>
        </div>
        <div className="pure-u-1-3 start_over_parent">
          {this.renderStartOver()}
        </div>
        <div className="pure-u-1">
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleOptionSelect={this.handleOptionSelect}
						qnData={this.props.qnData} 
					/>
				</div>
      </div>
    );
  }
}
