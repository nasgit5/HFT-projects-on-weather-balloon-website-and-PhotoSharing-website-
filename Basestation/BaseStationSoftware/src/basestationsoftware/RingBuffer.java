/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package basestationsoftware;

import java.util.LinkedList;

/**
 * Ring buffer with fixed size
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class RingBuffer<T> extends LinkedList<T>{
    
    private final int CAPACITY;
    
    public RingBuffer(int capacity) {
        CAPACITY=capacity;
    }
    
    

    
     
}
