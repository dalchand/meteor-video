var video = {
  width: 600,
  height: 400,
  qualities: [ 
    {
      name: "720p", 
      sources: [
        {type: "video/mp4", src: "test.mp4"}
      ]
    }
    // ,
    // {
    //   name: "480p", 
    //   sources: [
    //     {type: "video/webm", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_480.webm"},
    //     {type: "video/mp4", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_480.mp4"}
    //   ]
    // },
    // {
    //   name: "360p", 
    //   sources: [
    //     {type: "video/webm", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_360.webm"},
    //     {type: "video/mp4", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_360.mp4"}
    //   ]
    // },
    // {
    //   name: "240p", 
    //   sources: [
    //     {type: "video/webm", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_240.webm"},
    //     {type: "video/mp4", src: "http://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_240.mp4"}
    //   ]
    // }
  ],
  defaultQuality: 0
};

UI.body.video = function() {
  return video;
}  



