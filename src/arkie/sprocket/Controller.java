package arkie.sprocket;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class Controller implements Runnable, View.OnTouchListener{
	Map<Integer, Collection<Sprocket>> events =
		new HashMap<Integer, Collection<Sprocket>>();
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
	public void addListener(int mask, Sprocket sprocket){
		if (!events.containsKey(mask)) 
		   	events.put(mask, new ArrayList<Sprocket>());
		events.get(mask).add(sprocket);
	}
	public void addSprocket(Sprocket sprocket){sprockets.add(sprocket);}
	public SprocketView createView(){
		view = new SprocketView(this, sprockets);
		return view;
	}
	Player chr;
	public Player createPlayer(int bitmap){
		chr = new Player(this, loadBitmap(bitmap));
		chr.setTileSize(charWidth, charHeight);
		return chr;
	}
	public Charset createCharset(int bitmap){
		Charset chr = new Charset(this, loadBitmap(bitmap));
		chr.setTileSize(charWidth, charHeight);
		return chr;
	}
	public Tileset createTileset(int bitmap, short[][] map){
		Tileset tile = new Tileset(this, loadBitmap(bitmap));
		tile.setMap(map);
		tile.setTileSize(tileWidth, tileHeight);
		return tile;
	}
	public Context getContext(){return this.context;}
	Bitmap loadBitmap(int bitmap){
		return BitmapFactory.decodeResource(context.getResources(), bitmap);
	}
	public void run(){
		handler.postDelayed(this, 100);
		boolean dirty = false;
		for (Sprocket sprocket: sprockets)
			if (sprocket.update())
				dirty = true;
		if (dirty) view.invalidate();
	}
	public Rect getCamera(){
		return new Rect(0, 0, view.getWidth(), view.getHeight());
	}
	@Override public boolean onTouch(View view, MotionEvent event){
		int action = event.getAction() & 0xff /* MotionEvent.ACTION_MASK */;
		Collection<Sprocket> listeners = events.get(action);
		if (listeners != null)
			for (Sprocket listener: listeners)
				listener.onTouch(view, event);
		return true;
	}
}
