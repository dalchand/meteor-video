var video = {
  width: 600,
  height: 400,
  qualities: [ 
    {
      name: "720p", 
      src: "https://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_720.webm"
    },
    {
      name: "480p", 
      src: "https://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_480.webm"
    },
    {
      name: "360p", 
      src: "https://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_360.webm"
    },
    {
      name: "240p", 
      src: "https://download.dev.lifetape.com/p_142/processed_videos/74c18441a8b793c79e5cc986e8b4a236_1392050212558_44_240.webm"
    }
  ],
  defaultQuality: 2
};

UI.body.video = function() {
  return video;
}  



