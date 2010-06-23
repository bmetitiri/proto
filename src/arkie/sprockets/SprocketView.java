package arkie.sprockets;

import java.util.HashMap;
import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect
import android.view.View;

import arkie.sprockets.*;

public class SprocketView extends View {
	Bitmap chipset;
	HashMap<Short, Short> map = new HashMap<Short, Short>();
	Short fallback;
	int columns=30, rows=16, mapWidth=20, mapHeight=20,
		spriteWidth=16, spriteHeight=16;
	public SprocketView(Context context, int chipset){
		super(context);
		this.chipset = BitmapFactory.decodeResource(
				context.getResources(), chipset);
	}
	@Override protected void onDraw(Canvas canvas) {
		super.onDraw(canvas);
		for (int x = 0; x < mapWidth; x++)
			for (int y = 0; y < mapWidth; y++){
				Short s = map.get(x*mapWidth+y);
				if (s == null)
					s = fallback;
				if (s != null){
					int xi = s/columns*spriteWidth;
					int yi = s%columns*spriteHeight;
					canvas.drawBitmap(chipset,
						new Rect(xi, yi, xi+spriteWidth, yi+spriteHeight),
					   	new Rect(x*spriteWidth, y*spriteHeight,
							x*spriteWidth+spriteWidth,
							y*spriteHeight+spriteHeight), null);
				}
			}
	}
	public void setFallback(int x, int y){
		setFallback((short)(x*columns+y));
	}
	public void setFallback(Short fallback){this.fallback = fallback;}
	public void setGrid(int columns, int rows){
		this.columns = columns; this.rows = rows;
		spriteWidth = chipset.getWidth()/columns;
		spriteHeight = chipset.getHeight()/rows;
	}
	public void setSize(int width, int height){
		if (width*height < Short.MAX_VALUE){ // Just don't do it, kay?
			this.mapWidth = width; this.mapHeight = height;
		}
	}
}

