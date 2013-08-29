package nme;


import openfl.Assets;


class AssetData {

	
	public static var className = new #if haxe3 Map <String, #else Hash <#end Dynamic> ();
	public static var library = new #if haxe3 Map <String, #else Hash <#end LibraryType> ();
	public static var type = new #if haxe3 Map <String, #else Hash <#end AssetType> ();
	
	private static var initialized:Bool = false;
	
	
	public static function initialize ():Void {
		
		if (!initialized) {
			
			className.set ("assets/sound.mp3", nme.NME_assets_sound_mp3);
			type.set ("assets/sound.mp3", Reflect.field (AssetType, "music".toUpperCase ()));
			className.set ("assets/sound.wav", nme.NME_assets_sound_wav);
			type.set ("assets/sound.wav", Reflect.field (AssetType, "sound".toUpperCase ()));
			
			
			initialized = true;
			
		}
		
	}
	
	
}


class NME_assets_sound_mp3 extends flash.media.Sound { }
class NME_assets_sound_wav extends flash.media.Sound { }
