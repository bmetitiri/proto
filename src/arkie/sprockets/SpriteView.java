package arkie.sprockets;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.View;

import arkie.sprockets.*;

public class SpriteView extends View {
	SpriteMap map;
	public SpriteView(Context context){
		super(context);
	}
	public SpriteView(Context context, SpriteMap map){
		this(context);
		this.map = map;
	}
	@Override protected void onDraw(Canvas canvas) {
		super.onDraw(canvas);
		Sprite[][] m = map.getMap();
		int w = map.getSpriteWidth(), h = map.getSpriteHeight();
		for (int x = 0; x < map.width; x++){
			for (int y = 0; y < map.height; y++){
				if (m[x][y] != null)
					m[x][y].draw(canvas, new Rect(x*w, y*h, x*w+w, y*h+h));
			}
		}
	}
}
