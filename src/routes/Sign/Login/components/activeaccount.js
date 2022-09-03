import React from 'react';

export default class extends React.Component {
    
    componentDidMount(){
        console.log(this.props.location)
    }

    render() {
        return (<div className="full-layout page login-page">aaaa</div>);
    }
}