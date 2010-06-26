package arkie.sprocket;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory

import arkie.sprocket.*;

public class Controller implements Runnable{
	Handler handler;
	Collection<Sprocket> sprockets = new ArrayList<Sprocket>();
	Context context;
	SprocketView view;
	// Defaults are taken from RPGMaker for the most part
	int tileWidth = 16, tileHeight = 16, mapWidth=20, mapHeight=20;
	public Controller(Context context){
		this.context = context;
	}
	public void setTileSize(int width, int height){
		tileWidth = width; tileHeight = height;
	}
	public SprocketView getView(){
		if (view == null)
			view = new SprocketView(context, sprockets);
		return view;
	}
	Bitmap loadBitmap(int bitmap){
		return BitmapFactory.decodeResource(context.getResources(), bitmap);
	}
	public Tileset createTileset(int bitmap, int fallbackX, int fallbackY){
		Tileset tile = new Tileset(loadBitmap(bitmap));
		tile.setMapSize(mapWidth, mapHeight);
		tile.setTileSize(tileWidth, tileHeight);
		tile.setFallback(fallbackX, fallbackY);
		return tile;
	}
	public void run(){
		while(true){
			boolean dirty = false;
			for (Sprocket sprocket: sprockets)
				if (sprocket.update())
					dirty = true;
			if (dirty) view.invalidate();
			sleep(100);
		}
	}
	public void start(){
		Thread(this).start()
	}
}
