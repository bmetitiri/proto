package arkie.shing;

import android.content.Context;
import arkie.sprockets.*;

class Player extends CharSprite {
	public Player(Context context, int bitmap){
		super(context, bitmap);
		this.setType(2);
	}
}
