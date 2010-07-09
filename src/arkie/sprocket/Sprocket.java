package arkie.sprocket;

import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.View;
import android.view.View.OnTouchListener;

public interface Sprocket extends View.OnTouchListener{
	public void draw(Canvas canvas);
	public Rect getRect();
	public void setPosition(int x, int y);
	public boolean update();
}
