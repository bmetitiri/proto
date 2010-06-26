package arkie.sprocket;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;
import android.os.Handler;
import java.util.ArrayList;
import java.util.Collection;

public class Controller implements Runnable{
	Handler handler = new Handler();
	Collection<Sprocket> sprockets = new ArrayList<Sprocket>();
	Context context;
	SprocketView view;
	// Defaults are taken from RPGMaker for the most part
	int charWidth=24, charHeight=32, tileWidth=16, tileHeight=16;
	int	mapWidth=20, mapHeight=20;
	public Controller(Context context){this.context = context;}
	public void setCharSize(int width, int height){
		charWidth = width; charHeight = height;
	}
	public void setTileSize(int width, int height){
		tileWidth = width; tileHeight = height;
	}
	public void addSprocket(Sprocket sprocket){sprockets.add(sprocket);}
	public SprocketView createView(){
		view = new SprocketView(this, sprockets);
		return view;
	}
	public Player createPlayer(int bitmap){
		Player chr = new Player(this, loadBitmap(bitmap));
		chr.setTileSize(charWidth, charHeight);
		return chr;
	}
	public Charset createCharset(int bitmap){
		Charset chr = new Charset(this, loadBitmap(bitmap));
		chr.setTileSize(charWidth, charHeight);
		return chr;
	}
	public Tileset createTileset(int bitmap, int fallbackX, int fallbackY){
		Tileset tile = new Tileset(this, loadBitmap(bitmap));
		tile.setMapSize(mapWidth, mapHeight);
		tile.setTileSize(tileWidth, tileHeight);
		tile.setFallback(fallbackX, fallbackY);
		return tile;
	}
	public Context getContext(){return this.context;}
	Bitmap loadBitmap(int bitmap){
		return BitmapFactory.decodeResource(context.getResources(), bitmap);
	}
	public void run(){
		handler.postDelayed(this, 200);
		boolean dirty = false;
		for (Sprocket sprocket: sprockets)
			if (sprocket.update())
				dirty = true;
		if (dirty) view.invalidate();
	}
	public Rect getCamera(){
		return new Rect(0, 0, view.getWidth(), view.getHeight());
	}

//	public void startActivity(){
//		Context context = this.getContext();
//		Intent intent = new Intent(context, SprocketActivity.class);
//		context.startActivity(intent);
//	}
}
