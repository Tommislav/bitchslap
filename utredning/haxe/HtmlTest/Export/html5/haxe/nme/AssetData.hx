package nme;


import openfl.Assets;


class AssetData {

	
	public static var className = new Map <String, Dynamic> ();
	public static var library = new Map <String, LibraryType> ();
	public static var path = new Map <String, String> ();
	public static var type = new Map <String, AssetType> ();
	
	private static var initialized:Bool = false;
	
	
	public static function initialize ():Void {
		
		if (!initialized) {
			
			path.set ("assets/sound.mp3", "assets/sound.mp3");
			type.set ("assets/sound.mp3", Reflect.field (AssetType, "music".toUpperCase ()));
			path.set ("assets/sound.wav", "assets/sound.wav");
			type.set ("assets/sound.wav", Reflect.field (AssetType, "sound".toUpperCase ()));
			
			
			initialized = true;
			
		}
		
	}
	
	
}




