package;


import flash.display.Sprite;
import flash.media.Sound;
import openfl.Assets;


class Main extends Sprite {
	
	
	public function new () {
		
		super ();
		
		var snd:Sound = Assets.getSound("assets/sound.mp3");
		snd.play();
		
		
	}
	
	
}