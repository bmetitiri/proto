package arkie.sprockets;

import android.graphics.Canvas;
import android.graphics.Rect;

public interface Sprite {
	public void draw(Canvas canvas, Rect rect);
	public int getHeight();
	public int getWidth();
}
