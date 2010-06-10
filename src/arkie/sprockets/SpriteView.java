package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Canvas, Color, Paint
import android.view.View;

public class SpriteView extends View {
	/*Paint white = new Paint();
	public SpriteView(Context context){
		super(context);
		white.setColor(Color.WHITE);
	}
	@Override protected void onSizeChanged(int w, int h, int exw, int exh){
		super.onSizeChanged(w, h, exw, exh);
	} */
	@Override protected void onDraw(Canvas canvas) {
		super.onDraw(canvas);
//		canvas.drawRect(getWidth()/2, getHeight()/2, getWidth(), getHeight(), white);
	}
}
