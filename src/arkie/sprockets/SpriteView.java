package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Canvas, Color, Paint
import android.view.View;

import arkie.sprockets.*;

public class SpriteView extends View {
	SpriteMap map;
	Paint white = new Paint();
	public SpriteView(Context context){
		super(context);
		white.setColor(Color.WHITE);
	}
	public SpriteView(Context context, SpriteMap map){
		this(context);
		this.map = map;
	}
	@Override protected void onDraw(Canvas canvas) {
		super.onDraw(canvas);
		int[][] m = map.getMap();
		for (int x = 0; x < m.length; x++){
			for (int y = 0; y < m[0].length; y++){
				canvas.drawText(""+m[x][y], x*10, y*10, white);
			}
		}
	}
}
