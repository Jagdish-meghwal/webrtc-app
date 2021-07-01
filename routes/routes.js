import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

  FlowRouter.route("/", {
    action:async function (params, queryParams) {
      await import('../imports/ui/video.js');
      // BlazeLayout.render('app');
      BlazeLayout.render("home");
    },
  });

  FlowRouter.route('/video', {
    name: 'video',
     async action() {
      await import('../imports/ui/video.js');
      BlazeLayout.render('home',{main:'video'});
    }
  });
  
  FlowRouter.route('/sender', {
    name: 'sender',
     async action() {
      await import('../imports/ui/sender.js');
      BlazeLayout.render('home',{main:'sender'});
    }
  });

  FlowRouter.route('/receiver', {
    name: 'receiver',
     async action() {
      await import('../imports/ui/receiver.js');
      BlazeLayout.render('home',{main:'receiver'});
    }
  });